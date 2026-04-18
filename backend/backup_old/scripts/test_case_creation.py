import httpx
import asyncio

async def test_create_case():
    async with httpx.AsyncClient() as client:
        print("Testing POST /api/cases/ endpoint...")
        response = await client.post(
            "http://127.0.0.1:8000/api/cases/",
            json={
                "title": "Test Case 1",
                "client_name": "John Doe",
                "fir_number": "123/2024",
                "case_type": "Criminal",
                "description": "This is a test case description."
            }
        )
        print("Status Code:", response.status_code)
        if response.status_code == 201:
            print("Response JSON:", response.json())
            return response.json()["id"]
        else:
            print("Error:", response.text)
            return None

async def test_get_cases():
    async with httpx.AsyncClient() as client:
        print("\nTesting GET /api/cases/ endpoint...")
        response = await client.get("http://127.0.0.1:8000/api/cases/")
        print("Status Code:", response.status_code)
        print("Response JSON:", response.json())

if __name__ == "__main__":
    case_id = asyncio.run(test_create_case())
    if case_id:
        asyncio.run(test_get_cases())
