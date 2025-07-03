'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient, LinkDTO, LinkCreationDTO, LinkUpdateDTO } from '@/lib/api';
import { Plus, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';

export function LinkManager() {
  const [links, setLinks] = useState<LinkDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkDTO | null>(null);
  
  const [createData, setCreateData] = useState<LinkCreationDTO>({
    label: '',
    url: '',
    description: '',
  });
  
  const [editData, setEditData] = useState<LinkUpdateDTO>({
    id: '',
    label: '',
    url: '',
    description: '',
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getMyLinks();
      setLinks(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiClient.createLink(createData);
      setCreateData({ label: '', url: '', description: '' });
      setIsCreateDialogOpen(false);
      await loadLinks();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await apiClient.updateLink(editData);
      setEditingLink(null);
      await loadLinks();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    
    setIsLoading(true);
    try {
      await apiClient.deleteLink(id);
      await loadLinks();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (label: string) => {
    const url = `${window.location.origin}/${label}`;
    navigator.clipboard.writeText(url);
  };

  const openEditDialog = (link: LinkDTO) => {
    setEditData({
      id: link.id,
      label: link.label,
      url: link.url,
      description: link.description || '',
    });
    setEditingLink(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Links</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  required
                  pattern="^[a-zA-Z0-9-]+$"
                  value={createData.label}
                  onChange={(e) => setCreateData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="my-awesome-link"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only letters, numbers, and hyphens allowed
                </p>
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  required
                  value={createData.url}
                  onChange={(e) => setCreateData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={createData.description}
                  onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief description of your link"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Link'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading && links.length === 0 ? (
        <div className="text-center py-8">Loading links...</div>
      ) : (
        <div className="grid gap-4">
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No links found. Create your first link!
            </div>
          ) : (
            links.map((link) => (
              <Card key={link.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{link.label}</h3>
                      <p className="text-muted-foreground text-sm break-all">{link.url}</p>
                      {link.description && (
                        <p className="text-muted-foreground text-sm mt-1">{link.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.label)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(link)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                required
                pattern="^[a-zA-Z0-9-]+$"
                value={editData.label}
                onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                type="url"
                required
                value={editData.url}
                onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Link'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
