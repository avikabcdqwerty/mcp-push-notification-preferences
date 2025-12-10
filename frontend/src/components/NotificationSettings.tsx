import React, { useEffect, useState } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '../api/api';
import type { AuthUser } from '../App';

// Supported event types (should match backend)
const SUPPORTED_EVENT_TYPES: { key: string; label: string }[] = [
  { key: 'order_created', label: 'Order Created' },
  { key: 'order_shipped', label: 'Order Shipped' },
  { key: 'product_updated', label: 'Product Updated' },
  { key: 'promotion_launched', label: 'Promotion Launched' },
  // Add more event types as needed
];

// Type for notification preferences
export interface NotificationPreferences {
  [eventType: string]: boolean;
}

// Props for NotificationSettings component
interface NotificationSettingsProps {
  user: AuthUser;
}

/**
 * NotificationSettings component
 * Allows users to view and update push notification preferences per event type.
 */
const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch notification preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      setError(null);
      try {
        const prefs = await getNotificationPreferences(user.id);
        setPreferences(prefs);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load notification preferences.'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [user.id]);

  // Handle toggle for a specific event type
  const handleToggle = (eventType: string) => {
    setPreferences((prev) => ({
      ...prev,
      [eventType]: !prev[eventType],
    }));
    setSuccess(null);
    setError(null);
  };

  // Save preferences to backend
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateNotificationPreferences(user.id, preferences);
      setSuccess('Preferences updated successfully.');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update preferences. No changes were saved.'
      );
      // Optionally, reload preferences to prevent partial updates
      try {
        const prefs = await getNotificationPreferences(user.id);
        setPreferences(prefs);
      } catch {
        // Ignore secondary error, already handled
      }
    } finally {
      setSaving(false);
    }
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="notification-settings-loading">
        <span>Loading notification preferences...</span>
      </div>
    );
  }

  return (
    <section className="notification-settings-section">
      <h2>Push Notification Preferences</h2>
      <p>
        Enable or disable push notifications for each event type. Changes are saved securely and encrypted.
      </p>
      {error && (
        <div className="notification-settings-error" role="alert">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="notification-settings-success" role="status">
          <span>{success}</span>
        </div>
      )}
      <form
        className="notification-settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        autoComplete="off"
      >
        <table className="notification-settings-table">
          <thead>
            <tr>
              <th>Event Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {SUPPORTED_EVENT_TYPES.map((event) => (
              <tr key={event.key}>
                <td>{event.label}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!preferences[event.key]}
                      onChange={() => handleToggle(event.key)}
                      disabled={saving}
                      aria-checked={!!preferences[event.key]}
                      aria-label={`Toggle ${event.label} notifications`}
                    />
                    <span className="slider" />
                  </label>
                  <span className="status-label">
                    {preferences[event.key] ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="notification-settings-actions">
          <button
            type="submit"
            className="notification-settings-save-btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default NotificationSettings;