function NotificationTab(user: any) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h2>
      <form>
        <div className="mb-4 inline-flex items-center">
        <input
            type="checkbox"
            id="emailNotifications"
            className="block"
          />
          <label className="block text-sm font-medium text-gray-700 ml-2" htmlFor="emailNotifications">
            Email Notifications
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default NotificationTab;