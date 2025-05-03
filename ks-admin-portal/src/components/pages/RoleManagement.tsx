import { useState, useEffect } from 'react';
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions
} from '@/services/role.service';
import type { Role, RoleFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Shield, Lock } from 'lucide-react';

// Permission categories for organization
const permissionGroups = {
  products: ['products.view', 'products.create', 'products.edit', 'products.delete'],
  categories: ['categories.view', 'categories.create', 'categories.edit', 'categories.delete'],
  customers: ['customers.view', 'customers.create', 'customers.edit', 'customers.delete'],
  warranties: ['warranties.view', 'warranties.create', 'warranties.edit', 'warranties.delete'],
  content: ['content.view', 'content.edit', 'content.publish'],
  contact: ['contact.view', 'contact.reply', 'contact.delete'],
  users: ['users.view', 'users.create', 'users.edit', 'users.delete'],
  roles: ['roles.view', 'roles.create', 'roles.edit', 'roles.delete'],
};

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
  });

  // Load roles and permissions on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [rolesData, permissionsData] = await Promise.all([
          getRoles(),
          getPermissions()
        ]);
        setRoles(rolesData);
        setAvailablePermissions(permissionsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load roles and permissions');

        // Fallback: use the predefined permissions
        const fallbackPermissions = Object.values(permissionGroups).flat();
        setAvailablePermissions(fallbackPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;

    if (checked) {
      // Add permission
      setFormData(prev => ({
        ...prev,
        permissions: [...prev.permissions, value]
      }));
    } else {
      // Remove permission
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== value)
      }));
    }
  };

  const handleSelectAllInGroup = (group: string, checked: boolean) => {
    const groupPermissions = permissionGroups[group as keyof typeof permissionGroups] || [];

    if (checked) {
      // Add all permissions in the group that aren't already selected
      const newPermissions = [...new Set([
        ...formData.permissions,
        ...groupPermissions
      ])];
      setFormData(prev => ({
        ...prev,
        permissions: newPermissions
      }));
    } else {
      // Remove all permissions in the group
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => !groupPermissions.includes(p))
      }));
    }
  };

  const isGroupFullySelected = (group: string) => {
    const groupPermissions = permissionGroups[group as keyof typeof permissionGroups] || [];
    return groupPermissions.every(p => formData.permissions.includes(p));
  };

  const isGroupPartiallySelected = (group: string) => {
    const groupPermissions = permissionGroups[group as keyof typeof permissionGroups] || [];
    return groupPermissions.some(p => formData.permissions.includes(p)) &&
           !groupPermissions.every(p => formData.permissions.includes(p));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setIsEditing(false);
    setCurrentRole(null);
  };

  const handleAddRole = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = (role: Role) => {
    setCurrentRole(role);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentRole) return;

    try {
      await deleteRole(currentRole.id);

      // Update local state after successful deletion
      setRoles(prevRoles =>
        prevRoles.filter(role => role.id !== currentRole.id)
      );

      toast.success('Role deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error('Failed to delete role');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentRole) {
        // Update existing role
        const updatedRole = await updateRole(currentRole.id, formData);

        // Update roles array with the updated role
        setRoles(prevRoles =>
          prevRoles.map(role =>
            role.id === updatedRole.id ? updatedRole : role
          )
        );

        toast.success('Role updated successfully');
      } else {
        // Create new role
        const newRole = await createRole(formData);

        // Add new role to the roles array
        setRoles(prevRoles => [...prevRoles, newRole]);

        toast.success('Role created successfully');
      }

      // Close form and reset state
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save role:', error);
      toast.error('Failed to save role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Create and manage roles with specific permissions
          </p>
        </div>
        <Button onClick={handleAddRole}>
          <Plus className="mr-2 h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Define roles with specific permissions for admin users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <p>Loading roles...</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        No roles found. Click "Add Role" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className={`h-4 w-4 ${role.name.toLowerCase().includes('admin') ? 'text-red-500' : 'text-blue-500'}`} />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell>{role.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.length === 0 ? (
                              <span className="text-sm italic text-muted-foreground">No permissions</span>
                            ) : role.permissions.includes('all') ? (
                              <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">
                                All Permissions
                              </span>
                            ) : (
                              role.permissions.slice(0, 3).map((permission, i) => (
                                <span key={i} className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                  {permission}
                                </span>
                              ))
                            )}
                            {role.permissions.length > 3 && (
                              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditRole(role)}
                              title="Edit role"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(role)}
                              title="Delete role"
                              disabled={role.name.toLowerCase() === 'super admin'} // Prevent deletion of super admin
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Role Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Role Name
                </label>
                <Input
                  id="name"
                  name="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="my-4 border-t pt-4">
                <h3 className="mb-4 flex items-center gap-2 text-base font-semibold">
                  <Lock className="h-4 w-4" /> Permissions
                </h3>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Special "all" permission */}
                  <div className="col-span-full mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="permission-all"
                        name="permissions"
                        value="all"
                        checked={formData.permissions.includes('all')}
                        onChange={handlePermissionChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor="permission-all" className="font-semibold text-red-600">
                        All Permissions (Super Admin)
                      </label>
                    </div>
                  </div>

                  {/* Group permissions by category */}
                  {Object.entries(permissionGroups).map(([group, permissions]) => (
                    <div key={group} className="rounded-md border p-3">
                      <div className="mb-2 flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`group-${group}`}
                          checked={isGroupFullySelected(group)}
                          ref={elem => {
                            if (elem) {
                              elem.indeterminate = isGroupPartiallySelected(group);
                            }
                          }}
                          onChange={(e) => handleSelectAllInGroup(group, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={`group-${group}`} className="font-semibold capitalize">
                          {group}
                        </label>
                      </div>
                      <div className="ml-6 space-y-1">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`permission-${permission}`}
                              name="permissions"
                              value={permission}
                              checked={formData.permissions.includes(permission)}
                              onChange={handlePermissionChange}
                              className="h-4 w-4 rounded border-gray-300"
                              disabled={formData.permissions.includes('all')}
                            />
                            <label htmlFor={`permission-${permission}`} className="text-sm">
                              {permission.split('.')[1]}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {isEditing ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this role?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              "{currentRole?.name}". Users with this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleManagement;
