from pydantic import BaseModel
from typing import Optional, List, Any, Dict

class CleaningAction(BaseModel):
    action: str
    column: Optional[str] = None
    method: Optional[str] = None
    rows: Optional[List[int]] = None

class ModelConfig(BaseModel):
    target_column: str
    model_type: str
    test_size: float = 0.2

class SimulationConfig(BaseModel):
    model_type: str
    target_column: str
    input_values: Dict[str, Any]

class AIRequest(BaseModel):
    message: str
    context: Optional[str] = None
    step: Optional[str] = None
