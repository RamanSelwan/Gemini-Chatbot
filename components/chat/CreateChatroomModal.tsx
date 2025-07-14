
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chatroomSchema, ChatroomFormData } from '@/lib/validation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CreateChatroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChatroom: (title: string) => void;
}

export function CreateChatroomModal({ 
  isOpen, 
  onClose, 
  onCreateChatroom 
}: CreateChatroomModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChatroomFormData>({
    resolver: zodResolver(chatroomSchema),
  });

  const onSubmit = (data: ChatroomFormData) => {
    onCreateChatroom(data.title);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Chat"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Chat Title
          </label>
          <Input
            {...register('title')}
            placeholder="Enter chat title..."
            error={errors.title?.message}
            autoFocus
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            Create Chat
          </Button>
        </div>
      </form>
    </Modal>
  );
}
