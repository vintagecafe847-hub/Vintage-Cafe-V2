import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const DebugDeleteTest = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDeleteTest = async () => {
    setLoading(true);
    try {
      const results: any = {};

      // 1. Check current user
      const { data: user, error: userError } = await supabase.auth.getUser();
      results.user = {
        email: user?.user?.email,
        id: user?.user?.id,
        error: userError?.message,
      };

      // 2. Check admin status
      if (user?.user?.email) {
        const { data: adminCheck, error: adminError } = await supabase
          .from('admin_accounts')
          .select('email, is_active')
          .eq('email', user.user.email.toLowerCase())
          .eq('is_active', true)
          .single();

        results.adminCheck = {
          data: adminCheck,
          error: adminError?.message,
        };
      }

      // 3. Try to read menu items
      const { data: menuItems, error: readError } = await supabase
        .from('menu_items')
        .select('id, name')
        .limit(5);

      results.readTest = {
        canRead: !readError,
        itemCount: menuItems?.length || 0,
        error: readError?.message,
      };

      // 4. Try to read one specific item for delete test
      if (menuItems && menuItems.length > 0) {
        const testItem = menuItems[0];

        // Test if we can update first (as a proxy for delete permissions)
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', testItem.id);

        results.updateTest = {
          canUpdate: !updateError,
          error: updateError?.message,
          testItemId: testItem.id,
          testItemName: testItem.name,
        };
      }

      // 5. Call the debug function if it exists
      try {
        const { data: debugResult, error: debugError } = await supabase.rpc(
          'test_admin_access'
        );

        results.debugFunction = {
          data: debugResult,
          error: debugError?.message,
        };
      } catch (e) {
        results.debugFunction = {
          error: 'Debug function not available',
        };
      }

      setTestResults(results);
    } catch (error) {
      setTestResults({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">
        Delete Permission Debug Test
      </h3>

      <button
        onClick={runDeleteTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Run Delete Test'}
      </button>

      {testResults && (
        <div className="mt-4">
          <h4 className="font-semibold">Test Results:</h4>
          <pre className="bg-white p-4 border rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
