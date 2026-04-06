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

    def run(self, category: str = None,
            use_judge: bool = True) -> list[AttackResult]:
        payloads = self.load_payloads(category)

        console.print(f"\n[bold red]PROMPTHEUS[/bold red] — LLM Red Team Framework")
        console.print(f"[dim]Target: {self.adapter.base_url}[/dim]")
        console.print(f"[dim]Payloads loaded: {len(payloads)}[/dim]")
        console.print(f"[dim]AI judge: {'enabled' if use_judge else 'disabled'}[/dim]\n")

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

        if use_judge:
            from promptheus.judge import JudgeEngine
            judge = JudgeEngine()
            console.print("\n[bold]Phase 2 complete — starting AI judge...[/bold]")
            judge.evaluate_batch(self.results, verbose=True)

        self._print_summary()
        self._save_results()
        return self.results

    def _print_summary(self):
        console.print("\n[bold]Scan Complete[/bold]\n")

        table = Table(show_header=True, header_style="bold")
        table.add_column("ID",       style="dim",    width=8)
        table.add_column("Name",                     width=28)
        table.add_column("Category", style="cyan",   width=8)
        table.add_column("Severity", style="yellow", width=10)
        table.add_column("Raw",                      width=6)
        table.add_column("Judge",                    width=10)
        table.add_column("Conf",                     width=6)

        success_count = 0
        partial_count = 0

        for r in self.results:
            raw_str = "[red]HIT[/red]" if r.raw_success else "[green]MISS[/green]"

            if r.judge_verdict == "success":
                judge_str = "[bold red]SUCCESS[/bold red]"
                success_count += 1
            elif r.judge_verdict == "partial":
                judge_str = "[yellow]PARTIAL[/yellow]"
                partial_count += 1
            elif r.judge_verdict == "failure":
                judge_str = "[green]FAILURE[/green]"
            elif r.judge_verdict == "error":
                judge_str = "[dim]ERROR[/dim]"
            else:
                judge_str = "[dim]—[/dim]"

            conf_str = (f"{r.judge_confidence:.2f}"
                        if r.judge_confidence is not None else "—")

            table.add_row(
                r.payload_id,
                r.name[:28],
                r.category,
                r.severity,
                raw_str,
                judge_str,
                conf_str
            )

        console.print(table)

        total = len(self.results)
        failure_count = total - success_count - partial_count
        console.print(
            f"\n[bold]Judge results:[/bold] "
            f"[red]{success_count} success[/red] · "
            f"[yellow]{partial_count} partial[/yellow] · "
            f"[green]{failure_count} failure[/green] "
            f"out of {total} total\n"
        )

    def _save_results(self):
        from promptheus.scorer import OWASPScorer
        from promptheus.reporter import generate_report
        from datetime import datetime

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

        scorer = OWASPScorer()
        report = scorer.score(
            self.results,
            timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        )
        scorer.print_summary(report)

        pdf_path = generate_report(
            report,
            target_url=self.adapter.base_url
        )
        console.print(f"[bold green]Report saved to {pdf_path}[/bold green]")


if __name__ == "__main__":
    import sys
    target = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000"
    runner = PromptheusRunner(target_url=target, delay=0.5)
    runner.run()