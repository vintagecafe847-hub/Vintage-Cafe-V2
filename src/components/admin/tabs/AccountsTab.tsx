import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import { Loader2, Plus, Edit2, Trash2, Mail, User } from 'lucide-react';
import type { AdminAccount } from '../../../types/admin';

interface AccountsTabProps {
  accounts: AdminAccount[];
  dataLoading: boolean;
  updatingAccounts: Set<string>;
  onEditAccount: (account: AdminAccount) => void;
  onDeleteAccount: (id: string, email: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onCreateNew: () => void;
}

export const AccountsTab = ({
  accounts,
  dataLoading,
  updatingAccounts,
  onEditAccount,
  onDeleteAccount,
  onToggleStatus,
  onCreateNew,
}: AccountsTabProps) => {
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin Accounts
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage admin users who can access this panel
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const isUpdating = updatingAccounts.has(account.id);

          return (
            <Card
              key={account.id}
              className="bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                      <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate text-zinc-900 dark:text-zinc-100">
                        {account.display_name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3 text-zinc-400" />
                        <p className="text-sm truncate text-zinc-600 dark:text-zinc-400">
                          {account.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={account.is_active ? 'default' : 'secondary'}
                    className={
                      account.is_active
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : ''
                    }
                  >
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(checked) =>
                        onToggleStatus(account.id, checked)
                      }
                      disabled={isUpdating}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {account.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditAccount(account)}
                      disabled={isUpdating}
                      className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteAccount(account.id, account.email)}
                      disabled={isUpdating}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                  Created: {new Date(account.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <Card className="bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <CardContent className="py-12 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-zinc-400" />
            <h3 className="mb-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              No admin accounts found
            </h3>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              Create your first admin account to get started.
            </p>
            <Button
              onClick={onCreateNew}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
