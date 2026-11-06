import { useState } from "react";
import { useNotifications } from "./NotificationContext";
import "../App.css";

function GlobalNotification() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getIcon = (type) => {
    if (type === "event") return "📅";
    if (type === "od") return "📋";
    return "🔔";
  };

  return (
    <div className="cf-global-notification">

      <button
        className="cf-notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="cf-notification-count">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="cf-notification-overlay"
            onClick={() => setIsOpen(false)}
          />

          <div className="cf-notification-panel">

            <div className="cf-notification-header">
              <div>
                <h3>Notifications</h3>
                <p>
                  {unreadCount} unread notification
                  {unreadCount !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
            </div>

            <div className="cf-notification-list">

              {loading ? (
                <div className="cf-notification-empty">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="cf-notification-empty">
                  <span>🔔</span>
                  <h4>No notifications yet</h4>
                  <p>You're all caught up!</p>
                </div>
              ) : (

                notifications.map((notification) => (

                  <div
                    key={notification._id}
                    className={`cf-notification-item ${
                      notification.isRead ? "read" : "unread"
                    }`}
                  >

                    <div className="cf-notification-item-icon">
                      {getIcon(notification.type)}
                    </div>

                    <div className="cf-notification-content">

                      <strong>{notification.title}</strong>

                      <p>{notification.message}</p>

                      <small>
                        {formatDate(notification.createdAt)}
                      </small>

                      <div className="cf-notification-actions">

                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                          >
                            Mark as read
                          </button>
                        )}

                        <button
                          onClick={() =>
                            deleteNotification(notification._id)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                    {!notification.isRead && (
                      <span className="cf-notification-unread-dot" />
                    )}

                  </div>

                ))

              )}

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default GlobalNotification;