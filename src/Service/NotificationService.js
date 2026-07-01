import api from "../api/axios";

export const getNotifications = () => api.get("/api/notifications");
export const markNotificationRead = (id) => api.put(`/api/notifications/${id}/read`);
export const markAllNotificationsRead = (ids) =>
  Promise.all(ids.map((id) => markNotificationRead(id)));
