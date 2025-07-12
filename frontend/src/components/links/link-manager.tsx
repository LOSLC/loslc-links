'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient, LinkDTO, LinkCreationDTO, LinkUpdateDTO } from '@/lib/api';
import { Plus, Edit, Trash2, Copy, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export function LinkManager() {
  const [links, setLinks] = useState<LinkDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkDTO | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  
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
  }, [currentPage]);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * itemsPerPage;
      // Request one extra item to check if there are more pages
      const data = await apiClient.getMyLinks(skip, itemsPerPage + 1);
      
      if (data.length > itemsPerPage) {
        // There are more items, so remove the extra one and set hasMore to true
        setLinks(data.slice(0, itemsPerPage));
        setHasMore(true);
      } else {
        // No more items
        setLinks(data);
        setHasMore(false);
      }
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
      // Reset to first page after creating
      setCurrentPage(1);
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
      
      // If this was the only item on the current page and we're not on page 1,
      // go back to the previous page
      if (links.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadLinks();
      }
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

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Manage your shortened links
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Create Link</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">Create New Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label" className="text-sm font-medium text-gray-700">Label</Label>
                <Input
                  id="label"
                  required
                  pattern="^[a-zA-Z0-9-]+$"
                  value={createData.label}
                  onChange={(e) => setCreateData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="my-awesome-link"
                  className="border-gray-300"
                />
                <p className="text-xs text-gray-500">
                  Only letters, numbers, and hyphens allowed
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium text-gray-700">URL</Label>
                <Input
                  id="url"
                  type="url"
                  required
                  value={createData.url}
                  onChange={(e) => setCreateData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                <Input
                  id="description"
                  value={createData.description}
                  onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief description of your link"
                  className="border-gray-300"
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {isLoading && links.length === 0 ? (
        <div className="text-center py-8">Loading links...</div>
      ) : (
        <div className="grid gap-4">
          {links.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-lg mb-2">No links found</div>
              <div className="text-sm">Create your first link to get started!</div>
            </div>
          ) : (
            links.map((link) => (
              <Card key={link.id} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{link.label}</h3>
                      <p className="text-gray-600 text-sm break-all mb-2">{link.url}</p>
                      {link.description && (
                        <p className="text-gray-500 text-sm mb-3">{link.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Created: {new Date(link.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-col sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.label)}
                        className="flex-1 sm:flex-none"
                      >
                        <Copy className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Copy</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.url, '_blank')}
                        className="flex-1 sm:flex-none"
                      >
                        <ExternalLink className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Open</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(link)}
                        className="flex-1 sm:flex-none"
                      >
                        <Edit className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(link.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {links.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2">
          <div className="text-sm text-gray-600">
            Page {currentPage} • Showing {links.length} link{links.length !== 1 ? 's' : ''}
            {hasMore && ' • More available'}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasMore || isLoading}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">Edit Link</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-label" className="text-sm font-medium text-gray-700">Label</Label>
              <Input
                id="edit-label"
                required
                pattern="^[a-zA-Z0-9-]+$"
                value={editData.label}
                onChange={(e) => setEditData(prev => ({ ...prev, label: e.target.value }))}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url" className="text-sm font-medium text-gray-700">URL</Label>
              <Input
                id="edit-url"
                type="url"
                required
                value={editData.url}
                onChange={(e) => setEditData(prev => ({ ...prev, url: e.target.value }))}
                className="border-gray-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm font-medium text-gray-700">Description (Optional)</Label>
              <Input
                id="edit-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                className="border-gray-300"
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
