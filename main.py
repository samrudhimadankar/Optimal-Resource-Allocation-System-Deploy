import tkinter as tk
from tkinter import ttk
from job_scheduler import JobSchedulerApp
from resource_selector import ResourceSelectorApp
from efficiency_analyzer import EfficiencyAnalyzerApp

class MainApp:
    def __init__(self, root):
        root.title("Optimal Resource Allocation System")
        root.geometry("900x700")
        root.configure(bg="#eaf2f8")

        # ✅ Shared data dictionary
        shared_data = {
            "job_greedy_profit": 0,
            "job_brute_profit": 0,
            "resource_greedy_benefit": 0,
            "resource_brute_benefit": 0
        }

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TNotebook.Tab", font=("Segoe UI", 11, "bold"), padding=[10, 5])
        style.configure("TNotebook", background="#eaf2f8")

        notebook = ttk.Notebook(root)
        notebook.pack(fill='both', expand=True)

        job_tab = ttk.Frame(notebook)
        resource_tab = ttk.Frame(notebook)
        analyzer_tab = ttk.Frame(notebook)

        notebook.add(job_tab, text="Job Scheduler")
        notebook.add(resource_tab, text="Resource Selector")
        notebook.add(analyzer_tab, text="Efficiency Analyzer")

        # ✅ Pass shared_data to each module
        JobSchedulerApp(job_tab, shared_data)
        ResourceSelectorApp(resource_tab, shared_data)
        EfficiencyAnalyzerApp(analyzer_tab, shared_data)

if __name__ == "__main__":
    root = tk.Tk()
    app = MainApp(root)
    root.mainloop()