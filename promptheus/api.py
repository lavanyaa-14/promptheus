import warnings
warnings.filterwarnings("ignore")

import json
from pathlib import Path
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS

from promptheus.scorer import OWASPScorer

app = Flask(__name__)
CORS(app)  # Allow React dev server to call this API

SCAN_RESULTS_DIR = Path("scan_results")


def load_all_scans() -> list[dict]:
    scans = []
    for f in sorted(SCAN_RESULTS_DIR.glob("*.json")):
        try:
            data = json.loads(f.read_text())
            scans.append({
                "filename": f.name,
                "timestamp": f.stem.replace("scan_", ""),
                "results": data
            })
        except Exception:
            continue
    return scans


def load_latest_scan() -> dict | None:
    scans = load_all_scans()
    return scans[-1] if scans else None


@app.route("/api/latest")
def latest():
    scan = load_latest_scan()
    if not scan:
        return jsonify({"error": "No scan results found"}), 404

    from promptheus.models import AttackResult
    results = []
    for r in scan["results"]:
        ar = AttackResult(**{k: v for k, v in r.items()
                            if k in AttackResult.__dataclass_fields__})
        results.append(ar)

    scorer = OWASPScorer()
    report = scorer.score(results, timestamp=scan["timestamp"])

    return jsonify({
        "timestamp": scan["timestamp"],
        "overall_score": report.overall_score,
        "risk_level": report.risk_level,
        "total_attacks": report.total_attacks,
        "total_success": report.total_success,
        "total_partial": report.total_partial,
        "total_failure": report.total_failure,
        "total_error": report.total_error,
        "categories": {
            cat_id: {
                "name": cs.category_name,
                "total_tests": cs.total_tests,
                "successes": cs.successes,
                "partials": cs.partials,
                "failures": cs.failures,
                "risk_score": cs.risk_score,
            }
            for cat_id, cs in report.category_scores.items()
        },
        "findings": [
            {
                "payload_id":       r["payload_id"],
                "name":             r["name"],
                "category":         r["category"],
                "severity":         r["severity"],
                "attack_goal":      r["attack_goal"],
                "prompt":           r["prompt"],
                "response":         r["response"],
                "judge_verdict":    r["judge_verdict"],
                "judge_confidence": r["judge_confidence"],
                "judge_evidence":   r["judge_evidence"],
                "judge_notes":      r["judge_notes"],
                "raw_success":      r["raw_success"],
            }
            for r in scan["results"]
        ]
    })


@app.route("/api/trend")
def trend():
    scans = load_all_scans()
    if not scans:
        return jsonify([])

    from promptheus.models import AttackResult
    trend_data = []

    for scan in scans:
        try:
            results = []
            for r in scan["results"]:
                ar = AttackResult(**{k: v for k, v in r.items()
                                    if k in AttackResult.__dataclass_fields__})
                results.append(ar)

            scorer = OWASPScorer()
            report = scorer.score(results)

            trend_data.append({
                "timestamp": scan["timestamp"],
                "score": report.overall_score,
                "risk_level": report.risk_level,
                "success": report.total_success,
                "partial": report.total_partial,
            })
        except Exception:
            continue

    return jsonify(trend_data)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


if __name__ == "__main__":
    app.run(port=5001, debug=True)