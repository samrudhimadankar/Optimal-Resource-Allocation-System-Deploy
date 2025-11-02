import tkinter as tk
from tkinter import ttk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg

class EfficiencyAnalyzerApp:
    def __init__(self, root, shared_data):
        self.root = root
        self.shared_data = shared_data
        self.setup_styles()
        self.create_widgets()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TButton", font=("Segoe UI", 10, "bold"), foreground="#ffffff", background="#6f42c1", padding=6)
        style.map("TButton", background=[("active", "#5a32a3")])
        style.configure("TLabel", font=("Segoe UI", 10), background="#f9f9f9")
        style.configure("TEntry", padding=4)

    def create_widgets(self):
        frame = ttk.Frame(self.root)
        frame.pack(pady=10)

        ttk.Button(frame, text="Run Efficiency Analysis", command=self.run_analysis).grid(row=0, column=0, padx=10)

        self.output = tk.Text(self.root, height=10, width=95, bg="#ffffff", font=("Consolas", 10))
        self.output.pack(pady=10)

        self.chart_frame = ttk.Frame(self.root)
        self.chart_frame.pack()

    def run_analysis(self):
        self.output.delete("1.0", tk.END)

        # Get actual values from shared_data
        g_job = self.shared_data.get("job_greedy_profit", 0)
        b_job = self.shared_data.get("job_brute_profit", 1)
        g_res = self.shared_data.get("resource_greedy_benefit", 0)
        b_res = self.shared_data.get("resource_brute_benefit", 1)

        job_eff = round((g_job / b_job) * 100, 2) if b_job > 0 else 0
        res_eff = round((g_res / b_res) * 100, 2) if b_res > 0 else 0

        self.output.insert(tk.END, f"📊 Job Scheduling:\n")
        self.output.insert(tk.END, f"  Greedy Profit: ₹{g_job}\n")
        self.output.insert(tk.END, f"  Brute Force Profit: ₹{b_job}\n")
        self.output.insert(tk.END, f"  Efficiency: {job_eff}%\n\n")

        self.output.insert(tk.END, f"📊 Resource Selection:\n")
        self.output.insert(tk.END, f"  Greedy Benefit: ₹{g_res}\n")
        self.output.insert(tk.END, f"  Brute Force Benefit: ₹{b_res}\n")
        self.output.insert(tk.END, f"  Efficiency: {res_eff}%\n\n")

        self.output.insert(tk.END, f"🧠 Time Complexity:\n")
        self.output.insert(tk.END, f"  Greedy: O(n log n)\n")
        self.output.insert(tk.END, f"  Brute Force: O(2ⁿ)\n")

        self.plot_chart(g_job, b_job, g_res, b_res)

    def plot_chart(self, g_job, b_job, g_res, b_res):
        for widget in self.chart_frame.winfo_children():
            widget.destroy()

        fig, ax = plt.subplots(figsize=(6, 4))
        categories = ['Jobs', 'Resources']
        greedy = [g_job, g_res]
        brute = [b_job, b_res]

        bar_width = 0.35
        index = range(len(categories))

        ax.bar(index, greedy, bar_width, label='Greedy', color='#17a2b8')
        ax.bar([i + bar_width for i in index], brute, bar_width, label='Brute Force', color='#dc3545')

        ax.set_xlabel('Category')
        ax.set_ylabel('₹ Value')
        ax.set_title('Greedy vs Brute Force Comparison')
        ax.set_xticks([i + bar_width / 2 for i in index])
        ax.set_xticklabels(categories)
        ax.legend()

        canvas = FigureCanvasTkAgg(fig, master=self.chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack()