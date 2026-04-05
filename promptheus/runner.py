import warnings
warnings.filterwarnings("ignore")

import os
import json
import yaml
import time
from pathlib import Path
from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

from promptheus.models import AttackResult
from promptheus.adapters.web import WebAdapter

console = Console()

class PromptheusRunner:
    def __init__(self, target_url: str, delay: float = 0.5):
        self.adapter = WebAdapter(target_url)
        self.delay = delay
        self.results: list[AttackResult] = []
        self.payload_dir = Path("payloads")

    def load_payloads(self, category: str = None) -> list[dict]:
        all_payloads = []

        for yaml_file in self.payload_dir.rglob("*.yaml"):
            with open(yaml_file, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            if category and data.get("category") != category:
                continue

            for payload in data.get("payloads", []):
                payload["category"]    = data["category"]
                payload["subcategory"] = data.get("subcategory", "")
                payload["severity"]    = data.get("severity", "medium")
                all_payloads.append(payload)

        return all_payloads

    def check_raw_success(self, response: str,
                          indicators: list[str]) -> bool:
        response_lower = response.lower()
        return any(
            ind.lower() in response_lower
            for ind in indicators
        )

    def fire(self, payload: dict) -> AttackResult:
        endpoint = payload.get("endpoint", "/chat")
        response = self.adapter.send(payload["prompt"], endpoint)

        raw_success = self.check_raw_success(
            response,
            payload.get("success_indicators", [])
        )

        return AttackResult(
            payload_id=payload["id"],
            category=payload["category"],
            subcategory=payload["subcategory"],
            severity=payload["severity"],
            name=payload["name"],
            attack_goal=payload["attack_goal"],
            prompt=payload["prompt"],
            response=response,
            raw_success=raw_success,
            endpoint=endpoint
        )

    def run(self, category: str = None) -> list[AttackResult]:
        payloads = self.load_payloads(category)

        console.print(f"\n[bold red]PROMPTHEUS[/bold red] — LLM Red Team Framework")
        console.print(f"[dim]Target: {self.adapter.base_url}[/dim]")
        console.print(f"[dim]Payloads loaded: {len(payloads)}[/dim]\n")

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Running attacks...", total=len(payloads))

            for payload in payloads:
                progress.update(
                    task,
                    description=f"Firing [cyan]{payload['id']}[/cyan] — {payload['name']}"
                )

                result = self.fire(payload)
                self.results.append(result)

                time.sleep(self.delay)
                progress.advance(task)

        self._print_summary()
        self._save_results()
        return self.results

    def _print_summary(self):
        console.print("\n[bold]Scan Complete[/bold]\n")

        table = Table(show_header=True, header_style="bold")
        table.add_column("ID",       style="dim",    width=8)
        table.add_column("Name",                     width=30)
        table.add_column("Category", style="cyan",   width=8)
        table.add_column("Severity", style="yellow", width=10)
        table.add_column("Result",                   width=10)

        success_count = 0
        for r in self.results:
            if r.raw_success:
                result_str = "[bold red]HIT[/bold red]"
                success_count += 1
            else:
                result_str = "[green]MISS[/green]"

            table.add_row(
                r.payload_id,
                r.name[:30],
                r.category,
                r.severity,
                result_str
            )

        console.print(table)
        console.print(
            f"\n[bold]Results:[/bold] "
            f"[red]{success_count} hits[/red] / "
            f"[green]{len(self.results) - success_count} misses[/green] "
            f"out of {len(self.results)} total attacks\n"
        )

    def _save_results(self):
        output_dir = Path("scan_results")
        output_dir.mkdir(exist_ok=True)

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        output_file = output_dir / f"scan_{timestamp}.json"

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(
                [r.to_dict() for r in self.results],
                f,
                indent=2
            )

        console.print(f"[dim]Results saved to {output_file}[/dim]")


if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    runner = PromptheusRunner(target_url=target, delay=0.5)
    runner.run()