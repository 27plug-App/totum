function PreferencesTab(user: any) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences Settings</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="language">
            Preferred Language
          </label>
          <select
            id="language"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="timezone">
            Timezone
          </label>
          <select
            id="timezone"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="PST">Pacific Standard Time (PST)</option>
            <option value="MST">Mountain Standard Time (MST)</option>
            <option value="CST">Central Standard Time (CST)</option>
            <option value="EST">Eastern Standard Time (EST)</option>
          </select>
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

export default PreferencesTab;