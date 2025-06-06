export function exportToCSV(users, filename = 'users.csv') {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Created'];
  const rows = users.map(user => [
    user.name,
    user.email,
    user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : '',
    user.is_active ? 'Active' : 'Inactive',
    user.created_at ? new Date(user.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A',
  ]);
  let csvContent = '';
  csvContent += headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',') + '\n';
  });
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
