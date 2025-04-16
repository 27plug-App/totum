function AdvancedTab(user: any) {
  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h2>
      <form>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700" htmlFor="userNotes">
            User Notes
          </label>
          <textarea
            id="userNotes"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter your notes here"
            rows={4}
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

export default AdvancedTab;