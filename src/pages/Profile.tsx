import React from 'react';
import Header from '../components/Header';

export default function Profile() {
  return (
    <div className="bg-gray-50 dark:bg-[#192210] font-sans min-h-screen flex flex-col antialiased">
      <Header />
      <main className="flex-grow p-6 lg:p-12 max-w-4xl mx-auto w-full">
        <div className="bg-white dark:bg-[#232e1a] rounded-2xl shadow-sm p-8 md:p-12 border border-white dark:border-gray-200 dark:border-gray-700 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <div className="size-32 rounded-full bg-[#73d411]/10 flex items-center justify-center text-[#73d411] border-4 border-white dark:border-[#192210] shadow-md">
              <span className="material-symbols-outlined text-6xl">person</span>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-[#141b0d] dark:text-white mb-2">User Profile</h1>
              <p className="text-[#5c6b4f] dark:text-gray-400">Manage your personal information and account details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#141b0d] dark:text-white border-b border-[#edf3e7] dark:border-gray-200 dark:border-gray-700 pb-2">Personal Info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5c6b4f] dark:text-gray-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue="John Doe"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#192210]/50 border border-transparent focus:border-[#73d411] focus:ring-0 text-[#141b0d] dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5c6b4f] dark:text-gray-400 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue="john.doe@example.com"
                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#192210]/50 border border-transparent focus:border-[#73d411] focus:ring-0 text-[#141b0d] dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#141b0d] dark:text-white border-b border-[#edf3e7] dark:border-gray-200 dark:border-gray-700 pb-2">Account Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#192210]/50 border border-transparent">
                  <p className="text-2xl font-bold text-[#73d411]">12</p>
                  <p className="text-xs text-[#5c6b4f] dark:text-gray-400 uppercase font-bold tracking-wider">Decisions Made</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#192210]/50 border border-transparent">
                  <p className="text-2xl font-bold text-[#73d411]">48</p>
                  <p className="text-xs text-[#5c6b4f] dark:text-gray-400 uppercase font-bold tracking-wider">Total Responses</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[#edf3e7] dark:border-gray-200 dark:border-gray-700 flex justify-end">
            <button className="bg-[#73d411] hover:bg-[#65bd0f] text-[#141b0d] font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-[#73d411]/20 active:scale-95">
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
