import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { extractImagePath, generateFileName } from '../../utils/admin';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (
    file: File,
    folder: string = 'category-images'
  ): Promise<string> => {
    const fileName = generateFileName(file.name);
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) return;

    const filePath = extractImagePath(imageUrl);
    if (!filePath) return;

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      console.warn('Error deleting image:', error);
    }
  };

  const updateCategoryImage = async (
    categoryId: string,
    file: File,
    oldImageUrl?: string
  ): Promise<string> => {
    setUploading(true);
    try {
      // Upload new image
      const newUrl = await uploadImage(file, 'category-images');

      // Delete old image if present
      if (oldImageUrl) {
        try {
          await deleteImage(oldImageUrl);
        } catch (err) {
          console.warn('Failed deleting old image (continuing):', err);
        }
      }

      // Update database record
      const { error } = await supabase
        .from('categories')
        .update({ image_url: newUrl })
        .eq('id', categoryId);

      if (error) throw error;

      return newUrl;
    } finally {
      setUploading(false);
    }
  };

  const deleteCategoryImage = async (
    categoryId: string,
    imageUrl: string
  ): Promise<void> => {
    setUploading(true);
    try {
      // Delete from storage
      await deleteImage(imageUrl);

      // Clear image_url in database
      const { error } = await supabase
        .from('categories')
        .update({ image_url: null })
        .eq('id', categoryId);

      if (error) throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadImage,
    deleteImage,
    updateCategoryImage,
    deleteCategoryImage,
  };
};
