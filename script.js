const STORAGE_KEY = 'budget-tracker-expenses';
const CATEGORY_ORDER = ['Food', 'Transport', 'Rent', 'Entertainment', 'Utilities', 'Other'];
const CATEGORY_COLORS = {
	Food: '#0f766e',
	Transport: '#f59e0b',
	Rent: '#7c3aed',
	Entertainment: '#ef4444',
	Utilities: '#2563eb',
	Other: '#6b7280',
};

const form = document.getElementById('expense-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const formNote = document.getElementById('form-note');
const expenseList = document.getElementById('expense-list');
const totalSpending = document.getElementById('total-spending');
const expenseCount = document.getElementById('expense-count');
const categorySummary = document.getElementById('category-summary');
const chartCanvas = document.getElementById('category-chart');

let expenses = loadExpenses();
let categoryChart = null;

function createExpenseId() {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	return `expense-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadExpenses() {
	try {
		const storedValue = localStorage.getItem(STORAGE_KEY);
		if (!storedValue) {
			return [];
		}

		const parsed = JSON.parse(storedValue);
		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.filter((entry) => entry && typeof entry === 'object')
			.map((entry) => ({
				id: entry.id || createExpenseId(),
				description: String(entry.description || '').trim(),
				amount: Number(entry.amount),
				category: CATEGORY_ORDER.includes(entry.category) ? entry.category : 'Other',
				date: entry.date || new Date().toISOString().slice(0, 10),
			}))
			.filter((entry) => entry.description && Number.isFinite(entry.amount) && entry.amount > 0);
	} catch {
		return [];
	}
}

function saveExpenses() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(value) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(value);
}

function getCategoryTotals() {
	return CATEGORY_ORDER.reduce((totals, category) => {
		totals[category] = 0;
		return totals;
	}, {});
}

function renderExpenses() {
	if (expenses.length === 0) {
		expenseList.innerHTML = `
			<tr>
				<td class="empty-state" colspan="5">No expenses yet. Add one to get started.</td>
			</tr>
		`;
		return;
	}

	expenseList.innerHTML = expenses
		.slice()
		.sort((first, second) => new Date(second.date) - new Date(first.date))
		.map((expense) => `
			<tr data-id="${expense.id}">
				<td>${escapeHtml(expense.description)}</td>
				<td>${expense.category}</td>
				<td>${formatDate(expense.date)}</td>
				<td class="amount-cell">${formatCurrency(expense.amount)}</td>
				<td><button class="delete-button" type="button" data-delete="${expense.id}">Delete</button></td>
			</tr>
		`)
		.join('');
}

function renderSummary() {
	const categoryTotals = getCategoryTotals();

	expenses.forEach((expense) => {
		categoryTotals[expense.category] += expense.amount;
	});

	const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

	totalSpending.textContent = formatCurrency(total);
	expenseCount.textContent = String(expenses.length);

	categorySummary.innerHTML = CATEGORY_ORDER
		.map((category) => `
			<div class="category-pill">
				<span>${category}</span>
				<strong>${formatCurrency(categoryTotals[category])}</strong>
			</div>
		`)
		.join('');
}

function renderChart() {
	const categoryTotals = getCategoryTotals();

	expenses.forEach((expense) => {
		categoryTotals[expense.category] += expense.amount;
	});

	const values = CATEGORY_ORDER.map((category) => categoryTotals[category]);
	const hasData = values.some((value) => value > 0);

	if (categoryChart) {
		categoryChart.data.datasets[0].data = values;
		categoryChart.data.datasets[0].backgroundColor = CATEGORY_ORDER.map((category) => CATEGORY_COLORS[category]);
		categoryChart.update();
		return;
	}

	categoryChart = new Chart(chartCanvas, {
		type: 'doughnut',
		data: {
			labels: CATEGORY_ORDER,
			datasets: [{
				data: values,
				backgroundColor: CATEGORY_ORDER.map((category) => CATEGORY_COLORS[category]),
				borderColor: 'rgba(255, 255, 255, 0.95)',
				borderWidth: 3,
				hoverOffset: 8,
			}],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			cutout: '64%',
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						usePointStyle: true,
						pointStyle: 'circle',
						padding: 18,
						boxWidth: 12,
						color: '#1f2937',
						font: {
							family: 'Manrope',
							size: 12,
						},
					},
				},
				tooltip: {
					callbacks: {
						label(context) {
							const label = context.label || '';
							const value = context.parsed || 0;
							return `${label}: ${formatCurrency(value)}`;
						},
					},
				},
			},
		},
		plugins: [{
			id: 'empty-state-label',
			afterDraw(chart) {
				const currentValues = chart.data.datasets[0]?.data || [];
				const currentHasData = currentValues.some((value) => value > 0);

				if (currentHasData) {
					return;
				}

				const { ctx, chartArea } = chart;
				if (!chartArea) {
					return;
				}

				ctx.save();
				ctx.fillStyle = '#6b7280';
				ctx.font = '600 14px Manrope';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillText('Add expenses to see category breakdown', (chartArea.left + chartArea.right) / 2, (chartArea.top + chartArea.bottom) / 2);
				ctx.restore();
			},
		}],
	});
}

function renderAll() {
	renderExpenses();
	renderSummary();
	renderChart();
	saveExpenses();
}

function formatDate(dateString) {
	const date = new Date(`${dateString}T00:00:00`);
	if (Number.isNaN(date.getTime())) {
		return dateString;
	}

	return new Intl.DateTimeFormat('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function setTodayDefault() {
	if (!dateInput.value) {
		dateInput.value = new Date().toISOString().slice(0, 10);
	}
}

form.addEventListener('submit', (event) => {
	event.preventDefault();

	const description = descriptionInput.value.trim();
	const amount = Number(amountInput.value);
	const category = categoryInput.value;
	const date = dateInput.value;

	if (!description || !Number.isFinite(amount) || amount <= 0 || !date) {
		formNote.textContent = 'Please enter a description, a positive amount, and a date.';
		return;
	}

	expenses = [
		...expenses,
		{
			id: createExpenseId(),
			description,
			amount: Number(amount.toFixed(2)),
			category,
			date,
		},
	];

	form.reset();
	setTodayDefault();
	categoryInput.value = 'Food';
	formNote.textContent = 'Expense added.';
	renderAll();
});

expenseList.addEventListener('click', (event) => {
	const deleteButton = event.target.closest('[data-delete]');
	if (!deleteButton) {
		return;
	}

	const { delete: deleteId } = deleteButton.dataset;
	expenses = expenses.filter((expense) => expense.id !== deleteId);
	formNote.textContent = 'Expense deleted.';
	renderAll();
});

setTodayDefault();
renderAll();
