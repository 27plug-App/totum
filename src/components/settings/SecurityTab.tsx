function SecurityTab(user: any) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="currentPassword">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter current password"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="newPassword">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter new password"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Confirm new password"
          />
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

export default SecurityTab;