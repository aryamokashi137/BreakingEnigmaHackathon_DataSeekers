import httpx
import asyncio
import json

BASE_URL = "http://127.0.0.1:8000"

async def test_backend():
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("--- Testing Health Check ---")
        try:
            resp = await client.get(f"{BASE_URL}/health")
            print(f"Health: {resp.status_code} - {resp.json()}")
        except Exception as e:
            print(f"Health Check Failed: {e}")
            return

        print("\n--- Testing Create Case ---")
        case_data = {
            "title": "Test Murder Case 101",
            "client_name": "John Doe",
            "fir_number": "FIR/2024/001",
            "case_type": "Criminal",
            "description": "A test case for backend validation"
        }
        resp = await client.post(f"{BASE_URL}/api/cases/", json=case_data)
        print(f"Create Case: {resp.status_code}")
        if resp.status_code == 201:
            case = resp.json()
            case_id = case["id"]
            print(f"Created Case ID: {case_id}")
        else:
            print(f"Error: {resp.text}")
            return

        print("\n--- Testing Get All Cases ---")
        resp = await client.get(f"{BASE_URL}/api/cases/")
        print(f"Get All Cases: {resp.status_code} - {len(resp.json())} cases found")

        print("\n--- Testing Add Note ---")
        note_data = {"content": "Important witness identified."}
        resp = await client.post(f"{BASE_URL}/api/cases/{case_id}/notes", json=note_data)
        print(f"Add Note: {resp.status_code} - {resp.json()}")

        print("\n--- Testing Add Deadline ---")
        deadline_data = {
            "title": "Court Hearing",
            "due_date": "2024-12-01T10:00:00Z"
        }
        resp = await client.post(f"{BASE_URL}/api/cases/{case_id}/deadlines", json=deadline_data)
        print(f"Add Deadline: {resp.status_code} - {resp.json()}")

        print("\n--- Testing Research AI ---")
        research_query = {"query": "What are the sections for murder in IPC?"}
        resp = await client.post(f"{BASE_URL}/api/research/", json=research_query)
        print(f"Research AI: {resp.status_code}")
        if resp.status_code == 200:
            print(f"AI Answer: {resp.json().get('answer', 'No answer field')[:200]}...")
        else:
            print(f"Error: {resp.text}")

        print("\n--- Testing Case AI Chat ---")
        chat_query = {"message": "Summarize this case for me.", "case_id": case_id}
        resp = await client.post(f"{BASE_URL}/api/ai/chat", json=chat_query)
        print(f"Case Chat: {resp.status_code}")
        if resp.status_code == 200:
            print(f"Chat Response: {resp.json().get('result', 'No result field')[:200]}...")
        else:
            print(f"Error: {resp.text}")

        print("\n--- Testing Holistic Case Analysis ---")
        analysis_query = {"case_id": case_id}
        resp = await client.post(f"{BASE_URL}/api/ai/analyze-case", json=analysis_query)
        print(f"Holistic Analysis: {resp.status_code}")
        if resp.status_code == 200:
            print(f"Analysis: {resp.json().get('result', 'No result field')[:200]}...")
        else:
            print(f"Error: {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_backend())
