import httpx
import asyncio
import os

async def test_full_workflow():
    async with httpx.AsyncClient() as client:
        # 1. Create a case
        print("Creating case...")
        res = await client.post(
            "http://127.0.0.1:8000/api/cases/",
            json={
                "title": "Summarization Test Case",
                "client_name": "Test Client",
                "case_type": "Criminal",
                "description": "A test case for document summarization."
            }
        )
        case = res.json()
        case_id = case["id"]
        print(f"Created case ID: {case_id}")

        # 2. Upload a document
        print("Uploading document...")
        file_path = r"c:\Users\Ayush.Pardeshi\Documents\Ayush doc\brakingengima\backend\test_material\1_FIR.pdf"
        with open(file_path, "rb") as f:
            files = {"file": ("1_FIR.pdf", f, "application/pdf")}
            res = await client.post(
                f"http://127.0.0.1:8000/api/cases/{case_id}/upload",
                files=files
            )
        
        if res.status_code != 200:
            print("Upload failed:", res.text)
            return
            
        doc = res.json()
        doc_id = doc["id"]
        print(f"Uploaded document ID: {doc_id}")

        # 3. Summarize the document
        print("Summarizing document...")
        res = await client.post(
            "http://127.0.0.1:8000/api/ai/summarize",
            json={
                "case_id": case_id,
                "document_id": doc_id
            },
            timeout=60.0
        )
        print("Status Code:", res.status_code)
        if res.status_code == 200:
            print("Summary:", res.json()["result"])
        else:
            print("Error:", res.text)

        # 4. Test file download
        print("Testing file download...")
        filename = doc["filename"]
        res = await client.get(f"http://127.0.0.1:8000/api/cases/{case_id}/files/{filename}")
        print("Download Status Code:", res.status_code)
        if res.status_code == 200:
            print("Download successful!")

if __name__ == "__main__":
    asyncio.run(test_full_workflow())
