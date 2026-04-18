import os
import PyPDF2
from fastapi import UploadFile
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from services.vector_store import vector_store
from config import settings

class RAGService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            separators=["\n\n", "\n", ".", " ", ""]
        )
    
    async def process_pdf(self, file: UploadFile, case_id: str, section_type: str = "CaseLaw"):
        """Extracts text from PDF, chunks it, and saves to Vector DB"""
        # Save temp file
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as f:
            f.write(await file.read())
        
        # Read PDF
        text = ""
        try:
            with open(temp_file_path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for i, page in enumerate(reader.pages):
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                print(f"DEBUG: Extracted {len(text)} characters from PDF.")
        except Exception as pdf_e:
            print(f"DEBUG PDF ERROR: {str(pdf_e)}")
            raise pdf_e
        finally:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)

        if not text.strip():
            raise ValueError("No text could be extracted from the PDF.")

        # Chunk text
        chunks = self.text_splitter.split_text(text)
        
        # Create Documents with metadata
        documents = []
        for chunk in chunks:
            doc = Document(
                page_content=chunk,
                metadata={
                    "case_id": case_id,
                    "document_name": file.filename,
                    "section_type": section_type
                }
            )
            documents.append(doc)
            
        # Store in DB
        print(f"DEBUG: Adding {len(documents)} documents to vector store.")
        vector_store.add_documents(documents)
        print("DEBUG: Successfully saved to vector store.")
        return len(documents)

    def query_legal_research(self, query: str, case_id: str = None):
        """Retrieves context and queries LLM for an answer"""
        # Retrieve context
        filter_dict = {"case_id": str(case_id)} if case_id else None
        
        # Retrieve top 40 chunks to ensure we cover multiple documents in the case
        docs = vector_store.similarity_search(query, k=40, filter=filter_dict)
        context = "\n\n".join([f"Source: {d.metadata.get('document_name', 'Unknown')} - {d.metadata.get('section_type', 'N/A')}\nContent: {d.page_content}" for d in docs])
        
        sources = [d.metadata for d in docs]
        
        # Query LLM
        llm = self._get_llm()
        
        prompt_template = """
        You are a Senior Legal AI Expert. Your task is to perform a **Whole Case Analysis** based on the documents provided in the context below.
        
        Context from across uploaded case documents:
        {context}
        
        Instructions for your analysis:
        1. **Cross-Reference**: Check if different documents (e.g., FIR vs Witness Statement) agree or disagree on key facts.
        2. **Comprehensive Answer**: Provide a detailed answer that draws from multiple sources if possible.
        3. **Missing Info**: If the context doesn't have the answer, state which document might be missing.
        
        Question: {query}
        
        Answer structure:
        - Summary of Findings (Analyzing across documents)
        - Specific Evidence/Sections cited
        - Conclusion
        """
        
        prompt = PromptTemplate(template=prompt_template, input_variables=["context", "query"])
        chain = prompt | llm
        
        response = chain.invoke({"context": context, "query": query})
        answer_text = response.content if hasattr(response, "content") else response
        
        return {
            "answer": answer_text,
            "sources": sources
        }

    def analyze_case_holistically(self, case_id: str):
        """Performs a deep analysis across ALL documents in the case without a specific query."""
        filter_dict = {"case_id": str(case_id)}
        
        # We search for a broad query to get a wide variety of chunks
        # Ideally we'd get all chunks, but 100 top chunks is usually enough for a synthesis
        docs = vector_store.similarity_search("facts evidence summary charges legal issues", k=60, filter=filter_dict)
        
        if not docs:
            return {"answer": "No documents found for this case to analyze.", "sources": []}

        context = "\n\n".join([f"Source: {d.metadata.get('document_name', 'Unknown')}\nContent: {d.page_content}" for d in docs])
        sources = list(set([d.metadata.get('document_name') for d in docs]))

        llm = self._get_llm()

        prompt_template = """
        You are a Senior Legal Strategist. Perform a **Comprehensive Holistic Case Analysis** based on ALL the provided document snippets from this case.

        DOCUMENTS CONTEXT:
        {context}

        Your goal is to synthesize this information into a cohesive Case Intelligence Report.
        Please include:
        1. **Executive Summary**: A high-level overview of the entire case.
        2. **Fact Synthesis**: Connect the dots between different documents. Identify consistencies and contradictions.
        3. **Key Evidence List**: List the most critical pieces of evidence found across the files.
        4. **Legal Strengths & Weaknesses**: Based on the evidence, what are the strong points and the vulnerabilities?
        5. **Strategic Recommendations**: What should be the next steps?

        Format the output professionally using Markdown.
        """
        
        prompt = PromptTemplate(template=prompt_template, input_variables=["context"])
        chain = prompt | llm
        
        response = chain.invoke({"context": context})
        answer_text = response.content if hasattr(response, "content") else response
        
        return {
            "answer": answer_text,
            "documents_analyzed": sources
        }

    def _get_llm(self):
        if settings.GROQ_API_KEY:
            return ChatGroq(groq_api_key=settings.GROQ_API_KEY, temperature=0.1, model_name="llama-3.3-70b-versatile")
        elif settings.OPENAI_API_KEY:
            return ChatOpenAI(openai_api_key=settings.OPENAI_API_KEY, temperature=0.1, model="gpt-4o")
        else:
            from langchain_core.language_models import FakeListLLM
            return FakeListLLM(responses=["[MOCK AI ANSWER]: Analysis complete based on provided context."])

rag_service = RAGService()
