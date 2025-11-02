// Shared data for efficiency analyzer
const sharedData = {
    job_greedy_profit: 0,
    job_greedy_combination: [],
    job_greedy_sort: '',
    job_brute_profit: 0,
    job_brute_combination: [],
    job_time_limit: 0,
    resource_greedy_benefit: 0,
    resource_greedy_combination: [],
    resource_greedy_sort: '',
    resource_brute_benefit: 0,
    resource_brute_combination: [],
    resource_budget: 0
};

// Tab switching functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    });
});

// Job Scheduler Data
let jobs = [];

function addJob() {
    const name = document.getElementById('job-name').value.trim();
    const duration = parseFloat(document.getElementById('job-duration').value);
    const deadline = parseFloat(document.getElementById('job-deadline').value);
    const profit = parseFloat(document.getElementById('job-profit').value);
    
    if (!name || isNaN(duration) || isNaN(deadline) || isNaN(profit)) {
        alert('Please enter valid numbers for duration, deadline, and profit.');
        return;
    }
    
    jobs.push([name, duration, deadline, profit]);
    const output = document.getElementById('job-output');
    output.value += `Loaded: ${name} | Duration: ${duration} | Deadline: ${deadline} | Profit: ₹${profit}\n`;
    
    // Clear input fields
    document.getElementById('job-name').value = '';
    document.getElementById('job-duration').value = '';
    document.getElementById('job-deadline').value = '';
    document.getElementById('job-profit').value = '';
}

function clearJobOutput() {
    document.getElementById('job-output').value = '';
}

function scheduleJobs() {
    const timeLimit = parseFloat(document.getElementById('time-limit').value);
    const sortBy = document.getElementById('job-sort-type').value;
    
    if (jobs.length === 0) {
        alert('Please add at least one job before scheduling.');
        return;
    }
    
    // Sort jobs based on selected criteria
    let sortedJobs;
    if (sortBy === 'Max Profit') {
        sortedJobs = [...jobs].sort((a, b) => b[3] - a[3]);
    } else if (sortBy === 'Min Duration') {
        sortedJobs = [...jobs].sort((a, b) => a[1] - b[1]);
    } else {
        sortedJobs = [...jobs].sort((a, b) => (b[3] / b[1]) - (a[3] / a[1]));
    }
    
    // Greedy algorithm
    const greedySchedule = [];
    let totalTime = 0;
    let totalProfit = 0;
    
    for (const job of sortedJobs) {
        const [name, duration, deadline, profit] = job;
        if (totalTime + duration <= timeLimit && totalTime + duration <= deadline) {
            greedySchedule.push(job);
            totalTime += duration;
            totalProfit += profit;
        }
    }
    
    // Brute force algorithm
    let bestProfit = 0;
    let bestCombination = [];
    let bestTimeUsed = 0;
    
    for (let r = 1; r <= jobs.length; r++) {
        const combinations = getCombinations(jobs, r);
        for (const combo of combinations) {
            let timeUsed = 0;
            let isValid = true;
            
            for (let i = 0; i < combo.length; i++) {
                const [_, duration, deadline, __] = combo[i];
                timeUsed += duration;
                if (timeUsed > timeLimit || timeUsed > deadline) {
                    isValid = false;
                    break;
                }
            }
            
            if (isValid) {
                const profit = combo.reduce((sum, job) => sum + job[3], 0);
                if (profit > bestProfit) {
                    bestProfit = profit;
                    bestCombination = [...combo];
                    bestTimeUsed = timeUsed;
                }
            }
        }
    }
    
    const efficiency = bestProfit > 0 ? ((totalProfit / bestProfit) * 100).toFixed(2) : 0;
    
    // Update shared data
    sharedData.job_greedy_profit = totalProfit;
    sharedData.job_greedy_combination = greedySchedule;
    sharedData.job_greedy_sort = sortBy;
    sharedData.job_brute_profit = bestProfit;
    sharedData.job_brute_combination = bestCombination;
    sharedData.job_time_limit = timeLimit;
    
    // Display results
    const output = document.getElementById('job-output');
    output.value += '\n' + '='.repeat(70) + '\n';
    output.value += '📅 SCHEDULING JOBS...\n';
    output.value += '='.repeat(70) + '\n\n';
    output.value += `🔧 Sort By: ${sortBy}\n\n`;
    output.value += '✅ Greedy Schedule:\n';
    output.value += '-'.repeat(70) + '\n';
    
    if (greedySchedule.length > 0) {
        for (const job of greedySchedule) {
            const name = job[0] + ' '.repeat(Math.max(0, 20 - job[0].length));
            const duration = job[1].toFixed(1) + ' '.repeat(Math.max(0, 6 - job[1].toFixed(1).length));
            const deadline = job[2].toFixed(1) + ' '.repeat(Math.max(0, 6 - job[2].toFixed(1).length));
            output.value += `  • ${name} | Duration: ${duration} | Deadline: ${deadline} | Profit: ₹${job[3]}\n`;
        }
    } else {
        output.value += '  (No jobs could be scheduled within constraints)\n';
    }
    
    output.value += `\n📊 Available Time: ${timeLimit} hrs | Total Time Used: ${totalTime.toFixed(1)} hrs\n`;
    output.value += `💰 Total Profit: ₹${totalProfit}\n\n`;
    output.value += `🔍 Brute Force Optimal Profit: ₹${bestProfit}\n`;
    output.value += `⚡ Efficiency of Greedy: ${efficiency}%\n`;
    output.value += '='.repeat(70) + '\n';
    
    output.scrollTop = output.scrollHeight;
}

// Resource Selector Data
let resources = [];

function addResource() {
    const name = document.getElementById('resource-name').value.trim();
    const cost = parseFloat(document.getElementById('resource-cost').value);
    const benefit = parseFloat(document.getElementById('resource-benefit').value);
    
    if (!name || isNaN(cost) || isNaN(benefit)) {
        alert('Please enter valid numbers for cost and benefit.');
        return;
    }
    
    resources.push([name, cost, benefit]);
    const output = document.getElementById('resource-output');
    output.value += `Added: ${name}, Cost: ₹${cost}, Benefit: ₹${benefit}\n`;
    
    // Clear input fields
    document.getElementById('resource-name').value = '';
    document.getElementById('resource-cost').value = '';
    document.getElementById('resource-benefit').value = '';
}

function clearResourceOutput() {
    document.getElementById('resource-output').value = '';
}

function selectResources() {
    const budget = parseFloat(document.getElementById('budget-input').value);
    const sortBy = document.getElementById('resource-sort-type').value;
    
    if (resources.length === 0) {
        alert('Please add at least one resource before selecting.');
        return;
    }
    
    // Sort resources based on selected criteria
    let sortedResources;
    if (sortBy === 'Max Benefit') {
        sortedResources = [...resources].sort((a, b) => b[2] - a[2]);
    } else if (sortBy === 'Min Cost') {
        sortedResources = [...resources].sort((a, b) => a[1] - b[1]);
    } else {
        sortedResources = [...resources].sort((a, b) => (b[2] / b[1]) - (a[2] / a[1]));
    }
    
    // Greedy algorithm
    const selected = [];
    let totalCost = 0;
    let totalBenefit = 0;
    
    for (const res of sortedResources) {
        const [name, cost, benefit] = res;
        if (totalCost + cost <= budget) {
            selected.push(res);
            totalCost += cost;
            totalBenefit += benefit;
        }
    }
    
    // Brute force algorithm
    let bestBenefit = 0;
    let bestCombination = [];
    let bestCostUsed = 0;
    
    for (let r = 1; r <= resources.length; r++) {
        const combinations = getCombinations(resources, r);
        for (const combo of combinations) {
            const costSum = combo.reduce((sum, res) => sum + res[1], 0);
            if (costSum <= budget) {
                const benefitSum = combo.reduce((sum, res) => sum + res[2], 0);
                if (benefitSum > bestBenefit) {
                    bestBenefit = benefitSum;
                    bestCombination = [...combo];
                    bestCostUsed = costSum;
                }
            }
        }
    }
    
    const efficiency = bestBenefit > 0 ? ((totalBenefit / bestBenefit) * 100).toFixed(2) : 0;
    
    // Update shared data
    sharedData.resource_greedy_benefit = totalBenefit;
    sharedData.resource_greedy_combination = selected;
    sharedData.resource_greedy_sort = sortBy;
    sharedData.resource_brute_benefit = bestBenefit;
    sharedData.resource_brute_combination = bestCombination;
    sharedData.resource_budget = budget;
    
    // Display results
    const output = document.getElementById('resource-output');
    output.value += '\n' + '='.repeat(70) + '\n';
    output.value += '📦 SELECTING RESOURCES...\n';
    output.value += '='.repeat(70) + '\n\n';
    output.value += `🔧 Sort By: ${sortBy}\n\n`;
    output.value += '✅ Greedy Selection:\n';
    output.value += '-'.repeat(70) + '\n';
    
    if (selected.length > 0) {
        for (const res of selected) {
            const name = res[0] + ' '.repeat(Math.max(0, 20 - res[0].length));
            const cost = res[1].toFixed(2) + ' '.repeat(Math.max(0, 8 - res[1].toFixed(2).length));
            output.value += `  • ${name} | Cost: ₹${cost} | Benefit: ₹${res[2]}\n`;
        }
    } else {
        output.value += '  (No resources selected within budget)\n';
    }
    
    output.value += `\n💰 Budget: ₹${budget} | Total Cost: ₹${totalCost.toFixed(2)}\n`;
    output.value += `🎯 Total Benefit: ₹${totalBenefit}\n\n`;
    output.value += `🔍 Brute Force Optimal Benefit: ₹${bestBenefit}\n`;
    output.value += `⚡ Efficiency of Greedy: ${efficiency}%\n`;
    output.value += '='.repeat(70) + '\n';
    
    output.scrollTop = output.scrollHeight;
}

// Efficiency Analyzer
let chartInstance = null;

function runAnalysis() {
    const gJob = sharedData.job_greedy_profit || 0;
    const jobGreedyCombo = sharedData.job_greedy_combination || [];
    const jobGreedySort = sharedData.job_greedy_sort || '';
    const bJob = sharedData.job_brute_profit || 1;
    const jobBruteCombo = sharedData.job_brute_combination || [];
    const jobTimeLimit = sharedData.job_time_limit || 0;
    
    const gRes = sharedData.resource_greedy_benefit || 0;
    const resGreedyCombo = sharedData.resource_greedy_combination || [];
    const resGreedySort = sharedData.resource_greedy_sort || '';
    const bRes = sharedData.resource_brute_benefit || 1;
    const resBruteCombo = sharedData.resource_brute_combination || [];
    const resBudget = sharedData.resource_budget || 0;
    
    const jobEff = bJob > 0 ? ((gJob / bJob) * 100).toFixed(2) : 0;
    const resEff = bRes > 0 ? ((gRes / bRes) * 100).toFixed(2) : 0;
    
    const output = document.getElementById('analyzer-output');
    output.value = '';
    
    // Job Scheduling Analysis
    output.value += '📊 Job Scheduling:\n';
    output.value += `  Greedy Profit: ₹${gJob}\n`;
    output.value += `  Brute Force Profit: ₹${bJob}\n`;
    output.value += `  Efficiency: ${jobEff}%\n\n`;
    
    // Greedy Breakdown for Jobs
    if (jobGreedyCombo.length > 0) {
        output.value += '✅ Greedy Solution Breakdown:\n';
        output.value += '-'.repeat(70) + '\n';
        let cumulativeTime = 0;
        let totalProfit = 0;
        
        // Determine explanation based on sort type
        let sortExplanation = '';
        if (jobGreedySort === 'Max Profit') {
            sortExplanation = 'Jobs sorted by highest profit first (maximize immediate profit)';
        } else if (jobGreedySort === 'Min Duration') {
            sortExplanation = 'Jobs sorted by shortest duration first (fit more jobs in time limit)';
        } else {
            sortExplanation = 'Jobs sorted by profit/duration ratio first (best value per hour)';
        }
        
        output.value += `  Strategy: ${sortExplanation}\n`;
        output.value += `  Algorithm: Greedy (takes jobs in sorted order if they fit)\n\n`;
        
        for (let i = 0; i < jobGreedyCombo.length; i++) {
            const job = jobGreedyCombo[i];
            const [name, duration, deadline, profit] = job;
            cumulativeTime += duration;
            totalProfit += profit;
            
            const timeStr = duration.toFixed(1) + ' '.repeat(Math.max(0, 6 - duration.toFixed(1).length));
            const deadlineStr = deadline.toFixed(1) + ' '.repeat(Math.max(0, 6 - deadline.toFixed(1).length));
            const nameStr = name + ' '.repeat(Math.max(0, 20 - name.length));
            const ratio = (profit / duration).toFixed(2);
            
            output.value += `  ${i + 1}. ${nameStr} | Duration: ${timeStr} | Deadline: ${deadlineStr} | Profit: ₹${profit} | Ratio: ${ratio}\n`;
            output.value += `     └─ Selected because: Cumulative time (${cumulativeTime.toFixed(1)} hrs) ≤ ${jobTimeLimit} hrs limit AND ≤ ${deadline} hrs deadline\n`;
        }
        
        output.value += `\n  Summary: Selected ${jobGreedyCombo.length} jobs using ${cumulativeTime.toFixed(1)}/${jobTimeLimit} hrs\n`;
        output.value += `  Total Profit: ₹${totalProfit}\n`;
        output.value += `  Why This Result: Greedy algorithm makes locally optimal choice at each step by selecting jobs in sorted order that fit constraints.\n\n`;
    }
    
    // Brute Force Breakdown for Jobs
    if (jobBruteCombo.length > 0) {
        output.value += '🔍 Brute Force Optimal Solution Breakdown:\n';
        output.value += '-'.repeat(70) + '\n';
        let cumulativeTime = 0;
        let totalProfit = 0;
        
        for (let i = 0; i < jobBruteCombo.length; i++) {
            const job = jobBruteCombo[i];
            const [name, duration, deadline, profit] = job;
            cumulativeTime += duration;
            totalProfit += profit;
            
            const timeStr = duration.toFixed(1) + ' '.repeat(Math.max(0, 6 - duration.toFixed(1).length));
            const deadlineStr = deadline.toFixed(1) + ' '.repeat(Math.max(0, 6 - deadline.toFixed(1).length));
            const nameStr = name + ' '.repeat(Math.max(0, 20 - name.length));
            
            output.value += `  • ${nameStr} | Duration: ${timeStr} | Deadline: ${deadlineStr} | Profit: ₹${profit}\n`;
            output.value += `    └─ Cumulative Time: ${cumulativeTime.toFixed(1)} hrs (≤ ${jobTimeLimit} hrs limit, ≤ ${deadline} hrs deadline)\n`;
        }
        
        output.value += `\n  Summary: Selected ${jobBruteCombo.length} jobs using ${cumulativeTime.toFixed(1)}/${jobTimeLimit} hrs\n`;
        output.value += `  Total Profit: ₹${totalProfit} (This is the maximum possible profit)\n`;
        output.value += '  Why Optimal: Brute force tested ALL possible combinations (2ⁿ possibilities) and found this gives maximum profit.\n\n';
    } else if (bJob > 0) {
        output.value += '  Note: Optimal combination details not available. Run job scheduling first.\n\n';
    }
    
    // Resource Selection Analysis
    output.value += '📊 Resource Selection:\n';
    output.value += `  Greedy Benefit: ₹${gRes}\n`;
    output.value += `  Brute Force Benefit: ₹${bRes}\n`;
    output.value += `  Efficiency: ${resEff}%\n\n`;
    
    // Greedy Breakdown for Resources
    if (resGreedyCombo.length > 0) {
        output.value += '✅ Greedy Solution Breakdown:\n';
        output.value += '-'.repeat(70) + '\n';
        let cumulativeCost = 0;
        let totalBenefit = 0;
        
        // Determine explanation based on sort type
        let sortExplanation = '';
        if (resGreedySort === 'Max Benefit') {
            sortExplanation = 'Resources sorted by highest benefit first (maximize immediate benefit)';
        } else if (resGreedySort === 'Min Cost') {
            sortExplanation = 'Resources sorted by lowest cost first (fit more resources in budget)';
        } else {
            sortExplanation = 'Resources sorted by benefit/cost ratio first (best value per rupee)';
        }
        
        output.value += `  Strategy: ${sortExplanation}\n`;
        output.value += `  Algorithm: Greedy (takes resources in sorted order if they fit budget)\n\n`;
        
        for (let i = 0; i < resGreedyCombo.length; i++) {
            const res = resGreedyCombo[i];
            const [name, cost, benefit] = res;
            cumulativeCost += cost;
            totalBenefit += benefit;
            
            const costStr = cost.toFixed(2) + ' '.repeat(Math.max(0, 8 - cost.toFixed(2).length));
            const nameStr = name + ' '.repeat(Math.max(0, 20 - name.length));
            const ratio = (benefit / cost).toFixed(2);
            
            output.value += `  ${i + 1}. ${nameStr} | Cost: ₹${costStr} | Benefit: ₹${benefit} | Ratio: ${ratio}\n`;
            output.value += `     └─ Selected because: Cumulative cost (₹${cumulativeCost.toFixed(2)}) ≤ ₹${resBudget} budget\n`;
        }
        
        output.value += `\n  Summary: Selected ${resGreedyCombo.length} resources costing ₹${cumulativeCost.toFixed(2)}/${resBudget}\n`;
        output.value += `  Total Benefit: ₹${totalBenefit}\n`;
        output.value += `  Why This Result: Greedy algorithm makes locally optimal choice at each step by selecting resources in sorted order that fit budget.\n\n`;
    }
    
    // Brute Force Breakdown for Resources
    if (resBruteCombo.length > 0) {
        output.value += '🔍 Brute Force Optimal Solution Breakdown:\n';
        output.value += '-'.repeat(70) + '\n';
        let cumulativeCost = 0;
        let totalBenefit = 0;
        
        for (let i = 0; i < resBruteCombo.length; i++) {
            const res = resBruteCombo[i];
            const [name, cost, benefit] = res;
            cumulativeCost += cost;
            totalBenefit += benefit;
            
            const costStr = cost.toFixed(2) + ' '.repeat(Math.max(0, 8 - cost.toFixed(2).length));
            const nameStr = name + ' '.repeat(Math.max(0, 20 - name.length));
            const ratio = (benefit / cost).toFixed(2);
            
            output.value += `  • ${nameStr} | Cost: ₹${costStr} | Benefit: ₹${benefit} | Ratio: ${ratio}\n`;
            output.value += `    └─ Cumulative Cost: ₹${cumulativeCost.toFixed(2)} (≤ ₹${resBudget} budget)\n`;
        }
        
        output.value += `\n  Summary: Selected ${resBruteCombo.length} resources costing ₹${cumulativeCost.toFixed(2)}/${resBudget}\n`;
        output.value += `  Total Benefit: ₹${totalBenefit} (This is the maximum possible benefit)\n`;
        output.value += '  Why Optimal: Brute force tested ALL possible combinations (2ⁿ possibilities) and found this gives maximum benefit.\n\n';
    } else if (bRes > 0) {
        output.value += '  Note: Optimal combination details not available. Run resource selection first.\n\n';
    }
    
    output.value += '🧠 Time Complexity:\n';
    output.value += '  Greedy: O(n log n)\n';
    output.value += '  Brute Force: O(2ⁿ)\n';
    
    // Update chart
    plotChart(gJob, bJob, gRes, bRes);
}

function plotChart(gJob, bJob, gRes, bRes) {
    const ctx = document.getElementById('efficiency-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jobs', 'Resources'],
            datasets: [
                {
                    label: 'Greedy',
                    data: [gJob, gRes],
                    backgroundColor: '#17a2b8'
                },
                {
                    label: 'Brute Force',
                    data: [bJob, bRes],
                    backgroundColor: '#dc3545'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '₹ Value'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Category'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Greedy vs Brute Force Comparison',
                    font: {
                        size: 14
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        }
    });
}

// Excel Upload Handlers
function handleExcelUploadJob(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const output = document.getElementById('job-output');
            for (const row of jsonData) {
                const name = row['Job Name'] || row['job name'] || row['JobName'];
                const duration = parseFloat(row['Duration'] || row['duration']);
                const deadline = parseFloat(row['Deadline'] || row['deadline']);
                const profit = parseFloat(row['Profit'] || row['profit']);
                
                if (name && !isNaN(duration) && !isNaN(deadline) && !isNaN(profit)) {
                    jobs.push([name, duration, deadline, profit]);
                    output.value += `Loaded: ${name} | Duration: ${duration} | Deadline: ${deadline} | Profit: ₹${profit}\n`;
                }
            }
        } catch (error) {
            alert('Failed to load Excel file:\n' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

function handleExcelUploadResource(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            const output = document.getElementById('resource-output');
            for (const row of jsonData) {
                const name = row['Resource Name'] || row['resource name'] || row['ResourceName'];
                const cost = parseFloat(row['Cost'] || row['cost']);
                const benefit = parseFloat(row['Benefit'] || row['benefit']);
                
                if (name && !isNaN(cost) && !isNaN(benefit)) {
                    resources.push([name, cost, benefit]);
                    output.value += `Loaded: ${name} | Cost: ₹${cost} | Benefit: ₹${benefit}\n`;
                }
            }
        } catch (error) {
            alert('Failed to load Excel file:\n' + error.message);
        }
    };
    reader.readAsArrayBuffer(file);
}

// Helper function to generate combinations
function getCombinations(arr, k) {
    if (k === 0) return [[]];
    if (k > arr.length) return [];
    
    const combinations = [];
    
    function backtrack(start, current) {
        if (current.length === k) {
            combinations.push([...current]);
            return;
        }
        
        for (let i = start; i < arr.length; i++) {
            current.push(arr[i]);
            backtrack(i + 1, current);
            current.pop();
        }
    }
    
    backtrack(0, []);
    return combinations;
}

