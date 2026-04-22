interface StatusBadgeProps {
  status: "Active" | "At-risk" | "Dormant";
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const styles = {
    Active: "bg-success/15 text-success",
    "At-risk": "bg-warning/15 text-warning",
    Dormant: "bg-danger/15 text-danger",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
