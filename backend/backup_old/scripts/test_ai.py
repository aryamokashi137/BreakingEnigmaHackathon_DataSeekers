import httpx
import asyncio

async def test_ai_research():
    async with httpx.AsyncClient() as client:
        print("Testing POST /api/research/ endpoint...")
        # Note: ResearchQuery expects 'query' and 'case_id'
        response = await client.post(
            "http://127.0.0.1:8000/api/research/",
            json={
                "query": "What are the essential elements of a criminal conspiracy?",
                "case_id": None
            },
            timeout=30.0
        )
        print("Status Code:", response.status_code)
        if response.status_code == 200:
            print("Response JSON:", response.json())
        else:
            print("Error:", response.text)

if __name__ == "__main__":
    asyncio.run(test_ai_research())
