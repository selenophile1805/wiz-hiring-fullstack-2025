from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import events, bookings


app = FastAPI(
    title="BookMySlot API"
)


app.include_router(events.router)
app.include_router(bookings.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False, 
    allow_methods=["*"],  
    allow_headers=["*"],  
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to BookMySlot API",
        "version": "1.0.0",
        "docs": "/docs"
    }




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8085) 