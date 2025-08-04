type Assignment = {
  id: string;
  assignedDate: string | Date;
  status: string;
  [key: string]: unknown;
};

export function getDeliveryOrder(assignments: Assignment[]) {
  // Sort assignments by creation date (oldest first)
  const sortedAssignments = [...assignments].sort(
    (a, b) =>
      new Date(a.assignedDate).getTime() - new Date(b.assignedDate).getTime()
  );

  return sortedAssignments.map((assignment, index) => ({
    ...assignment,
    deliveryOrder: index + 1,
    isCurrentDelivery: index === 0 && assignment.status === "pending",
    canStart: index === 0 && assignment.status === "pending",
    isBlocked: index > 0 && sortedAssignments[index - 1].status !== "delivered",
  }));
}

export function canStartDelivery(
  assignments: Assignment[],
  targetAssignmentId: string
) {
  const orderedAssignments = getDeliveryOrder(assignments);
  const targetAssignment = orderedAssignments.find(
    (a) => a.id === targetAssignmentId
  );

  if (!targetAssignment) return false;

  // Can only start if it's the first pending delivery
  return targetAssignment.canStart;
}

export function getActiveDelivery(assignments: Assignment[]) {
  // Find the current in-transit delivery
  const inTransit = assignments.find((a) => a.status === "in-transit");
  if (inTransit) return inTransit;

  // Otherwise, find the next pending delivery that can be started
  const orderedAssignments = getDeliveryOrder(assignments);
  return orderedAssignments.find((a) => a.canStart);
}
