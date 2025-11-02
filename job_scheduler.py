import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import itertools
import pandas as pd

class JobSchedulerApp:
    def __init__(self, root, shared_data):
        self.root = root
        self.shared_data = shared_data
        self.jobs = []

        self.setup_styles()
        self.create_widgets()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TButton", font=("Segoe UI", 10, "bold"), foreground="#ffffff", background="#007acc", padding=6)
        style.map("TButton", background=[("active", "#005f99")])
        style.configure("TLabel", font=("Segoe UI", 10), background="#f0f4f7")
        style.configure("TEntry", padding=4)

    def create_widgets(self):
        frame = ttk.Frame(self.root)
        frame.pack(pady=10)

        ttk.Label(frame, text="Job Name").grid(row=0, column=0)
        ttk.Label(frame, text="Duration (hrs)").grid(row=0, column=1)
        ttk.Label(frame, text="Deadline (hrs)").grid(row=0, column=2)
        ttk.Label(frame, text="Profit (₹)").grid(row=0, column=3)

        self.job_name = ttk.Entry(frame)
        self.job_duration = ttk.Entry(frame)
        self.job_deadline = ttk.Entry(frame)
        self.job_profit = ttk.Entry(frame)

        self.job_name.grid(row=1, column=0)
        self.job_duration.grid(row=1, column=1)
        self.job_deadline.grid(row=1, column=2)
        self.job_profit.grid(row=1, column=3)

        ttk.Button(frame, text="Add Job", command=self.add_job).grid(row=1, column=4, padx=10)

        ttk.Label(frame, text="Available Time (hrs):").grid(row=2, column=0, pady=10)
        self.time_limit = ttk.Entry(frame)
        self.time_limit.insert(0, "8.0")
        self.time_limit.grid(row=2, column=1)

        ttk.Label(frame, text="Sort By:").grid(row=2, column=2)
        self.sort_type = ttk.Combobox(frame, values=["Max Profit", "Min Duration", "Best Ratio"])
        self.sort_type.set("Best Ratio")
        self.sort_type.grid(row=2, column=3)

        ttk.Button(frame, text="Upload from Excel", command=self.upload_excel).grid(row=3, column=0, columnspan=2, pady=5)
        ttk.Button(frame, text="Schedule Jobs", command=self.schedule_jobs).grid(row=2, column=4)
        ttk.Button(frame, text="Clear Output", command=self.clear_output).grid(row=3, column=4)

        self.output = tk.Text(self.root, height=25, width=100, bg="#ffffff", font=("Consolas", 10))
        self.output.pack(pady=10)

    def clear_output(self):
        self.output.delete("1.0", tk.END)

    def upload_excel(self):
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            try:
                df = pd.read_excel(file_path)
                for _, row in df.iterrows():
                    self.jobs.append((row["Job Name"], row["Duration"], row["Deadline"], row["Profit"]))
                    self.output.insert(tk.END, f"Loaded: {row['Job Name']} | Duration: {row['Duration']} | Deadline: {row['Deadline']} | Profit: ₹{row['Profit']}\n")
            except Exception as e:
                messagebox.showerror("Upload Error", f"Failed to load Excel file:\n{e}")

    def add_job(self):
        try:
            name = self.job_name.get()
            duration = float(self.job_duration.get())
            deadline = float(self.job_deadline.get())
            profit = float(self.job_profit.get())
            self.jobs.append((name, duration, deadline, profit))
            self.output.insert(tk.END, f"Loaded: {name} | Duration: {duration} | Deadline: {deadline} | Profit: ₹{profit}\n")
        except ValueError:
            messagebox.showerror("Invalid Input", "Please enter valid numbers for duration, deadline, and profit.")

    def schedule_jobs(self):
        time_limit = float(self.time_limit.get())
        sort_by = self.sort_type.get()

        if sort_by == "Max Profit":
            sorted_jobs = sorted(self.jobs, key=lambda x: x[3], reverse=True)
        elif sort_by == "Min Duration":
            sorted_jobs = sorted(self.jobs, key=lambda x: x[1])
        else:
            sorted_jobs = sorted(self.jobs, key=lambda x: x[3]/x[1], reverse=True)

        greedy_schedule = []
        total_time = 0
        total_profit = 0

        for job in sorted_jobs:
            name, duration, deadline, profit = job
            if total_time + duration <= time_limit and total_time + duration <= deadline:
                greedy_schedule.append(job)
                total_time += duration
                total_profit += profit

        best_profit = 0
        for r in range(1, len(self.jobs)+1):
            for combo in itertools.combinations(self.jobs, r):
                time_used = sum(j[1] for j in combo)
                if time_used <= time_limit and all(sum(j[1] for j in combo[:i+1]) <= j[2] for i, j in enumerate(combo)):
                    profit = sum(j[3] for j in combo)
                    if profit > best_profit:
                        best_profit = profit

        efficiency = round((total_profit / best_profit) * 100, 2) if best_profit > 0 else 0

        # 🧾 Formatted Output
        self.output.insert(tk.END, "\n" + "="*70 + "\n")
        self.output.insert(tk.END, "📅 SCHEDULING JOBS...\n")
        self.output.insert(tk.END, "="*70 + "\n\n")

        self.output.insert(tk.END, f"🔧 Sort By: {sort_by}\n\n")
        self.output.insert(tk.END, "✅ Greedy Schedule:\n")
        self.output.insert(tk.END, "-"*70 + "\n")

        if greedy_schedule:
            for job in greedy_schedule:
                self.output.insert(tk.END, f"  • {job[0]:20} | Duration: {job[1]:<6} | Deadline: {job[2]:<6} | Profit: ₹{job[3]}\n")
        else:
            self.output.insert(tk.END, "  (No jobs could be scheduled within constraints)\n")

        self.output.insert(tk.END, f"\n📊 Available Time: {time_limit} hrs | Total Time Used: {total_time} hrs\n")
        self.output.insert(tk.END, f"💰 Total Profit: ₹{total_profit}\n\n")
        self.output.insert(tk.END, f"🔍 Brute Force Optimal Profit: ₹{best_profit}\n")
        self.output.insert(tk.END, f"⚡ Efficiency of Greedy: {efficiency}%\n")
        self.output.insert(tk.END, "="*70 + "\n")

        # Update shared data
        self.shared_data["job_greedy_profit"] = total_profit
        self.shared_data["job_brute_profit"] = best_profit