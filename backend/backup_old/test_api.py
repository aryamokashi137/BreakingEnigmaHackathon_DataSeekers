import httpx
import asyncio

async def test_research():
    async with httpx.AsyncClient() as client:
        print("Testing POST /research/ endpoint...")
        response = await client.post(
            "http://127.0.0.1:8000/api/research/",
            json={
                "query": "What is the punishment for cheating under IPC?"
            }
        )
        print("Status Code:", response.status_code)
        print("Response JSON:", response.json())

if __name__ == "__main__":
    asyncio.run(test_research())
