import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import itertools
import pandas as pd

class ResourceSelectorApp:
    def __init__(self, root, shared_data):
        self.root = root
        self.shared_data = shared_data
        self.resources = []

        self.setup_styles()
        self.create_widgets()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("TButton", font=("Segoe UI", 10, "bold"), foreground="#ffffff", background="#28a745", padding=6)
        style.map("TButton", background=[("active", "#218838")])
        style.configure("TLabel", font=("Segoe UI", 10), background="#f7f9fc")
        style.configure("TEntry", padding=4)

    def create_widgets(self):
        frame = ttk.Frame(self.root)
        frame.pack(pady=10)

        ttk.Label(frame, text="Resource Name").grid(row=0, column=0)
        ttk.Label(frame, text="Cost (₹)").grid(row=0, column=1)
        ttk.Label(frame, text="Benefit (₹)").grid(row=0, column=2)

        self.res_name = ttk.Entry(frame)
        self.res_cost = ttk.Entry(frame)
        self.res_benefit = ttk.Entry(frame)

        self.res_name.grid(row=1, column=0)
        self.res_cost.grid(row=1, column=1)
        self.res_benefit.grid(row=1, column=2)

        ttk.Button(frame, text="Add Resource", command=self.add_resource).grid(row=1, column=3, padx=10)

        ttk.Label(frame, text="Budget (₹):").grid(row=2, column=0, pady=10)
        self.budget_input = ttk.Entry(frame)
        self.budget_input.insert(0, "10000")
        self.budget_input.grid(row=2, column=1)

        ttk.Label(frame, text="Sort By:").grid(row=2, column=2)
        self.sort_type = ttk.Combobox(frame, values=["Max Benefit", "Min Cost", "Best Ratio"])
        self.sort_type.set("Best Ratio")
        self.sort_type.grid(row=2, column=3)

        ttk.Button(frame, text="Upload from Excel", command=self.upload_excel).grid(row=3, column=0, columnspan=2, pady=5)
        ttk.Button(frame, text="Select Resources", command=self.select_resources).grid(row=2, column=4)

        self.output = tk.Text(self.root, height=25, width=100, bg="#ffffff", font=("Consolas", 10))
        self.output.pack(pady=10)
        ttk.Button(frame, text="Clear Output", command=self.clear_output).grid(row=3, column=4)


    def clear_output(self):
        self.output.delete("1.0", tk.END)

    def upload_excel(self):
        file_path = filedialog.askopenfilename(filetypes=[("Excel files", "*.xlsx")])
        if file_path:
            try:
                df = pd.read_excel(file_path)
                for _, row in df.iterrows():
                    self.resources.append((row["Resource Name"], row["Cost"], row["Benefit"]))
                    self.output.insert(tk.END, f"Loaded: {row['Resource Name']} | Cost: ₹{row['Cost']} | Benefit: ₹{row['Benefit']}\n")
            except Exception as e:
                messagebox.showerror("Upload Error", f"Failed to load Excel file:\n{e}")

    def add_resource(self):
        try:
            name = self.res_name.get()
            cost = float(self.res_cost.get())
            benefit = float(self.res_benefit.get())
            self.resources.append((name, cost, benefit))
            self.output.insert(tk.END, f"Added: {name}, Cost: ₹{cost}, Benefit: ₹{benefit}\n")
        except ValueError:
            messagebox.showerror("Invalid Input", "Please enter valid numbers for cost and benefit.")

    def select_resources(self):
        budget = float(self.budget_input.get())
        sort_by = self.sort_type.get()

        if sort_by == "Max Benefit":
            sorted_resources = sorted(self.resources, key=lambda x: x[2], reverse=True)
        elif sort_by == "Min Cost":
            sorted_resources = sorted(self.resources, key=lambda x: x[1])
        else:
            sorted_resources = sorted(self.resources, key=lambda x: x[2]/x[1], reverse=True)

        selected = []
        total_cost = 0
        total_benefit = 0

        for res in sorted_resources:
            name, cost, benefit = res
            if total_cost + cost <= budget:
                selected.append(res)
                total_cost += cost
                total_benefit += benefit

        best_benefit = 0
        for r in range(1, len(self.resources)+1):
            for combo in itertools.combinations(self.resources, r):
                cost_sum = sum(item[1] for item in combo)
                if cost_sum <= budget:
                    benefit_sum = sum(item[2] for item in combo)
                    if benefit_sum > best_benefit:
                        best_benefit = benefit_sum

        efficiency = round((total_benefit / best_benefit) * 100, 2) if best_benefit > 0 else 0

        # 🧾 Formatted Output
        self.output.insert(tk.END, "\n" + "="*70 + "\n")
        self.output.insert(tk.END, "📦 SELECTING RESOURCES...\n")
        self.output.insert(tk.END, "="*70 + "\n\n")

        self.output.insert(tk.END, f"🔧 Sort By: {sort_by}\n\n")
        self.output.insert(tk.END, "✅ Greedy Selection:\n")
        self.output.insert(tk.END, "-"*70 + "\n")

        if selected:
            for res in selected:
                self.output.insert(tk.END, f"  • {res[0]:20} | Cost: ₹{res[1]:<8} | Benefit: ₹{res[2]}\n")
        else:
            self.output.insert(tk.END, "  (No resources selected within budget)\n")

        self.output.insert(tk.END, f"\n💰 Budget: ₹{budget} | Total Cost: ₹{total_cost}\n")
        self.output.insert(tk.END, f"🎯 Total Benefit: ₹{total_benefit}\n\n")
        self.output.insert(tk.END, f"🔍 Brute Force Optimal Benefit: ₹{best_benefit}\n")
        self.output.insert(tk.END, f"⚡ Efficiency of Greedy: {efficiency}%\n")
        self.output.insert(tk.END, "="*70 + "\n")

        # Update shared data
        self.shared_data["resource_greedy_benefit"] = total_benefit
        self.shared_data["resource_brute_benefit"] = best_benefit