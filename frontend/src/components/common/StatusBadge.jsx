const statusStyles = {
  // Lead statuses
  'New': 'bg-slate-100 text-slate-700',
  'Contacted': 'bg-blue-100 text-blue-700',
  'Qualified': 'bg-indigo-100 text-indigo-700',
  'Proposal Sent': 'bg-yellow-100 text-yellow-700',
  'Negotiation': 'bg-orange-100 text-orange-700',
  'Won': 'bg-green-100 text-green-700',
  'Lost': 'bg-red-100 text-red-700',
  'On Hold': 'bg-gray-100 text-gray-700',
  // Deal stages
  'Prospecting': 'bg-slate-100 text-slate-700',
  'Qualification': 'bg-blue-100 text-blue-700',
  'Proposal': 'bg-yellow-100 text-yellow-700',
  'Closed Won': 'bg-green-100 text-green-700',
  'Closed Lost': 'bg-red-100 text-red-700',
  // Priority
  'Low': 'bg-slate-100 text-slate-600',
  'Medium': 'bg-blue-100 text-blue-600',
  'High': 'bg-orange-100 text-orange-600',
  'Critical': 'bg-red-100 text-red-600',
  'Urgent': 'bg-red-100 text-red-600',
  // Task status
  'Pending': 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-gray-100 text-gray-500',
  // Client status
  'Active': 'bg-green-100 text-green-700',
  'Inactive': 'bg-gray-100 text-gray-600',
  'Prospect': 'bg-blue-100 text-blue-700',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`badge ${style} ${size === 'xs' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      {status}
    </span>
  );
}
