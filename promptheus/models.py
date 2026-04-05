from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class AttackResult:
    payload_id: str
    category: str
    subcategory: str
    severity: str
    name: str
    attack_goal: str
    prompt: str
    response: str
    raw_success: bool
    endpoint: str = "/chat"
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    judge_verdict: Optional[str] = None
    judge_confidence: Optional[float] = None
    judge_evidence: Optional[str] = None

    def to_dict(self) -> dict:
        return {
            "payload_id": self.payload_id,
            "category": self.category,
            "subcategory": self.subcategory,
            "severity": self.severity,
            "name": self.name,
            "attack_goal": self.attack_goal,
            "prompt": self.prompt,
            "response": self.response,
            "raw_success": self.raw_success,
            "endpoint": self.endpoint,
            "timestamp": self.timestamp,
            "judge_verdict": self.judge_verdict,
            "judge_confidence": self.judge_confidence,
            "judge_evidence": self.judge_evidence
        }