from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins; for production, restrict this to your domain(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FlashcardRequest(BaseModel):
    inputText: str

@app.post("/generate_flashcards")
async def generate_flashcards(request: FlashcardRequest):
    prompt = (
        "You are an assistant that extracts flashcards from text. "
        "Each line of the input text is in the format 'term - definition'. "
        "Your task is to output a JSON array of tuples [front, back]. "
        "For example, if the input text is:\n"
        "femur - is a bone in a human leg\n"
        "A bone in the upper arm is called humerus\n"
        "Then the output should be: [[\"femur\", \"is a bone in a human leg\"], [\"humerus\", \"is a bone in the upper arm\"]].\n\n"
        f"Now extract flashcards from the following text:\n{request.inputText}"
    )
    
    command = ["ollama", "run", "llama2:7b", prompt]
    
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        output_text = result.stdout.strip()
        
        # Extract JSON array from the output
        json_start = output_text.find('[')
        json_end = output_text.rfind(']')
        if json_start == -1 or json_end == -1:
            raise ValueError("Could not find a JSON array in the output.")
        json_str = output_text[json_start:json_end+1]
        flashcards = json.loads(json_str)
        return {"flashcards": flashcards}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Ollama command failed: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
