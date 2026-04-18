"""
Multi-Provider Language Model Interface for Legal RAG Pipeline
=============================================================

This module provides a unified interface for accessing multiple large language
model providers, including OpenAI, Anthropic, Mistral, Google Gemini, DeepSeek,
Groq, and local Ollama models.

The module automatically detects the appropriate provider based on model names
and handles the initialization of the corresponding LangChain model instances.

Supported Providers:
- OpenAI (GPT models)
- Anthropic (Claude models)
- Mistral AI
- Google Gemini
- DeepSeek
- Groq
- Ollama (local models)

"""

import os
from enum import Enum
from typing import Optional
import logging


class ModelProvider(str, Enum):
    """
    Enumeration of supported language model providers.
    
    This enum defines all the supported model providers that can be
    accessed through the unified interface.
    """
    ANTHROPIC = "Anthropic"
    DEEPSEEK = "DeepSeek"
    GEMINI = "Gemini"
    GROQ = "Groq"
    OPENAI = "OpenAI"
    MISTRAL = "Mistral"
    OLLAMA = "Ollama"


def _normalized_model_name(model_name: str) -> str:
    """Normalize model names for provider detection."""
    return model_name.strip().lower()


def _detect_provider(model_name: str) -> Optional[ModelProvider]:
    """
    Automatically detect the model provider based on model name.
    
    This function analyzes the model name string to determine which
    provider should be used, enabling automatic provider selection.
    
    Args:
        model_name (str): The name of the model to analyze
        
    Returns:
        ModelProvider: The detected provider enum value, or None if unknown
    """
    name = _normalized_model_name(model_name)
    
    # Provider detection based on common naming patterns
    if name.startswith("mistral") or name.startswith("mistral/"):
        return ModelProvider.MISTRAL
    elif (
        name.startswith("llama")
        or name.startswith("phi")
        or name.startswith("codellama")
        or name.startswith("gemma")
        or name.startswith("qwen")
        or name.startswith("deepseek-r1")
    ):
        return ModelProvider.OLLAMA
    elif name.startswith("gpt") or name.startswith("openai/") or "text-embedding-3" in name:
        return ModelProvider.OPENAI
    elif name.startswith("anthropic") or name.startswith("anthropic/") or name.startswith("claude"):
        return ModelProvider.ANTHROPIC
    elif name.startswith("deepseek") or name.startswith("deepseek/"):
        return ModelProvider.DEEPSEEK
    elif name.startswith("gemini") or name.startswith("google/") or name.startswith("google-gemini"):
        return ModelProvider.GEMINI
    elif name.startswith("groq") or name.startswith("groq/"):
        return ModelProvider.GROQ
    
    return None


def _get_openai_client_kwargs() -> dict:
    """Build OpenAI-compatible client kwargs, including OpenRouter settings."""
    client_kwargs = {}
    base_url = os.getenv("OPENAI_BASE_URL")
    if base_url:
        client_kwargs["base_url"] = base_url

    default_headers = {}
    http_referer = os.getenv("HTTP_REFERER")
    x_title = os.getenv("X_TITLE")
    if http_referer:
        default_headers["HTTP-Referer"] = http_referer
    if x_title:
        default_headers["X-Title"] = x_title
    if default_headers:
        client_kwargs["default_headers"] = default_headers

    return client_kwargs


def get_llm_model(model_name: str, ollama_local: bool = False, **kwargs):
    """
    Get a LangChain-compatible LLM instance for the specified model.
    
    This function creates and returns the appropriate LangChain model
    instance based on the model name. It handles provider detection,
    API key validation, and model initialization.
    
    Args:
        model_name (str): Name of the model to instantiate
        ollama_local (bool): Force use of local Ollama if True
        **kwargs: Additional arguments passed to the model constructor
        
    Returns:
        LangChain model instance configured for the specified provider
        
    Raises:
        ValueError: If provider cannot be detected or API key is missing
        ImportError: If required provider package is not installed
    """
    detected_provider = _detect_provider(model_name)
    if detected_provider is None:
        raise ValueError(f"Could not detect provider from model name: {model_name}")
    
    # Only force local Ollama when the model is actually an Ollama model.
    provider = ModelProvider.OLLAMA if (ollama_local and detected_provider == ModelProvider.OLLAMA) else detected_provider
    provider_kwargs = dict(kwargs)
    if provider != ModelProvider.OLLAMA:
        provider_kwargs.pop("num_ctx", None)
        provider_kwargs.pop("extract_reasoning", None)

    try:
        # Ollama (local and remote)
        if provider == ModelProvider.OLLAMA and ollama_local:
            from langchain_ollama import ChatOllama  # type: ignore
            return ChatOllama(model=model_name, **provider_kwargs)
        elif provider == ModelProvider.OLLAMA:
            from langchain_ollama import ChatOllama # type: ignore
            return ChatOllama(model=model_name, **provider_kwargs)
        # Groq
        elif provider == ModelProvider.GROQ:
            from langchain_groq import ChatGroq # type: ignore
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("Groq API key not found.")
            return ChatGroq(model=model_name, api_key=api_key, **provider_kwargs)
            
        # OpenAI
        elif provider == ModelProvider.OPENAI:
            from langchain_openai import ChatOpenAI # type: ignore
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OpenAI API key not found.")
            return ChatOpenAI(
                model=model_name,
                api_key=api_key,
                **_get_openai_client_kwargs(),
                **provider_kwargs,
            )
            
        # Anthropic
        elif provider == ModelProvider.ANTHROPIC:
            from langchain_anthropic import ChatAnthropic # type: ignore
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if not api_key:
                raise ValueError("Anthropic API key not found.")
            return ChatAnthropic(model=model_name, api_key=api_key, **provider_kwargs)
            
        # DeepSeek
        elif provider == ModelProvider.DEEPSEEK:
            from langchain_deepseek import ChatDeepSeek # type: ignore
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise ValueError("DeepSeek API key not found.")
            return ChatDeepSeek(model=model_name, api_key=api_key, **provider_kwargs)
            
        # Google Gemini
        elif provider == ModelProvider.GEMINI:
            from langchain_google_genai import ChatGoogleGenerativeAI # type: ignore
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("Google API key not found.")
            return ChatGoogleGenerativeAI(model=model_name, api_key=api_key, **provider_kwargs)
            
        # Mistral AI
        elif provider == ModelProvider.MISTRAL:
            from langchain_mistralai import ChatMistralAI # type: ignore
            api_key = os.getenv("MISTRAL_API_KEY")
            if not api_key:
                raise ValueError("Mistral API key not found.")
            return ChatMistralAI(model=model_name, api_key=api_key, **provider_kwargs)
        else:
            raise ValueError("Unknown model provider or configuration.")
            
    except Exception as e:
        raise ValueError(f"Model '{model_name}' is not supported or incorrect init: {e}")


def get_embedding_model(model_name: str, ollama_local: bool = False, **kwargs):
    """
    Get a LangChain-compatible embedding model instance.
    
    This function creates and returns the appropriate LangChain embedding
    model instance based on the model name. Embedding models are used for
    converting text into vector representations for semantic search.
    
    Args:
        model_name (str): Name of the embedding model to instantiate
        ollama_local (bool): Force use of local Ollama if True
        **kwargs: Additional arguments passed to the embedding model constructor
        
    Returns:
        LangChain embedding model instance configured for the specified provider
        
    Raises:
        ValueError: If provider cannot be detected, API key is missing, or 
                   provider doesn't support embeddings
        ImportError: If required provider package is not installed
    """
    provider = _detect_provider(model_name)
    if provider is None:
        raise ValueError(f"Could not detect provider from model name: {model_name}")
    provider_kwargs = dict(kwargs)
    if provider != ModelProvider.OLLAMA:
        provider_kwargs.pop("wait_time", None)

    try:
        # Ollama (local and remote)
        if provider == ModelProvider.OLLAMA and ollama_local:
            from langchain_community.embeddings import OllamaEmbeddings # type: ignore
            return OllamaEmbeddings(model=model_name, **provider_kwargs)
        elif provider == ModelProvider.OLLAMA:
            from langchain_community.embeddings import OllamaEmbeddings # type: ignore
            return OllamaEmbeddings(model=model_name, **provider_kwargs)
            
        # Groq
        elif provider == ModelProvider.GROQ:
            from langchain_groq import GroqEmbeddings # type: ignore
            api_key = os.getenv("GROQ_API_KEY")
            if not api_key:
                raise ValueError("Groq API key not found.")
            return GroqEmbeddings(model=model_name, api_key=api_key, **provider_kwargs)
            
        # OpenAI
        elif provider == ModelProvider.OPENAI:
            from langchain_openai import OpenAIEmbeddings # type: ignore
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise ValueError("OpenAI API key not found.")
            return OpenAIEmbeddings(
                model=model_name,
                api_key=api_key,
                **_get_openai_client_kwargs(),
                **provider_kwargs,
            )
            
        # Anthropic (no embedding models available)
        elif provider == ModelProvider.ANTHROPIC:
            raise ValueError("Anthropic does not support embedding models.")
            
        # DeepSeek
        elif provider == ModelProvider.DEEPSEEK:
            from langchain_deepseek import DeepSeekEmbeddings # type: ignore
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise ValueError("DeepSeek API key not found.")
            return DeepSeekEmbeddings(model=model_name, api_key=api_key, **provider_kwargs)
            
        # Google Gemini
        elif provider == ModelProvider.GEMINI:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings # type: ignore
            api_key = os.getenv("GOOGLE_API_KEY")
            if not api_key:
                raise ValueError("Google API key not found.")
            return GoogleGenerativeAIEmbeddings(model=model_name, api_key=api_key, **provider_kwargs)
            
        # Mistral AI
        elif provider == ModelProvider.MISTRAL:
            from langchain_mistralai import MistralAIEmbeddings # type: ignore
            api_key = os.getenv("MISTRAL_API_KEY")
            if not api_key:
                raise ValueError("Mistral API key not found.")
            return MistralAIEmbeddings(model=model_name, api_key=api_key, **provider_kwargs)
        else:
            raise ValueError("Unknown model provider or configuration.")
            
    except Exception as e:
        raise ValueError(f"Embedding model '{model_name}' is not supported or incorrect init: {e}")


if __name__ == "__main__":
    """
    Example usage and testing for model provider functionality.
    
    This section demonstrates how to initialize both LLM and embedding
    models using the provider interface.
    """
    # Example model configurations
    llm_name = "gemma3:4b"
    llm_kwargs = {
        "temperature": 0.0,
        "num_ctx": 16000,
        "extract_reasoning": False
    }
    
    embeded_name = "mistral-embed"
    embed_kwargs = {
        "wait_time": 60
    }
    
    try:
        # Initialize LLM model
        llm_model = get_llm_model(llm_name, ollama_local=True, **llm_kwargs)
        logging.info(f"LLM Model: {llm_model}")

        # Initialize embedding model
        embedding_model = get_embedding_model(embeded_name, **embed_kwargs)
        logging.info(f"Embedding Model: {embedding_model}")

    except ValueError as e:
        logging.error(f"Error: {e}")
