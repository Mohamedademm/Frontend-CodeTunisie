import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import adminService from '@/services/adminService';

interface ImageUploaderProps {
    onImageUploaded: (imageData: { url: string; filename: string; size: number }) => void;
    currentImage?: { url: string; filename: string };
    onImageRemoved?: () => void;
}

export default function ImageUploader({ onImageUploaded, currentImage, onImageRemoved }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string>(currentImage?.url || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync preview with prop when switching questions
    useEffect(() => {
        setPreview(currentImage?.url || '');
    }, [currentImage]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file: File) => {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Format non supporté. Utilisez JPEG, PNG ou WebP');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            toast.error('L\'image est trop grande. Taille max: 2MB');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await adminService.uploadQuestionImage(formData);

            if (response.success) {
                toast.success('Image uploadée avec succès');
                onImageUploaded(response.data);
            } else {
                throw new Error(response.message || 'Erreur upload');
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Erreur lors de l\'upload');
            setPreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (currentImage?.filename) {
            try {
                await adminService.deleteQuestionImage(currentImage.filename);
                toast.success('Image supprimée');
            } catch (error) {
                console.error('Delete error:', error);
            }
        }
        setPreview('');
        if (onImageRemoved) onImageRemoved();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Image (optionnel)</label>

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview.startsWith('data:') || preview.startsWith('http') || preview.startsWith('blob:') ? preview : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${preview}`}
                        alt="Preview"
                        className="w-full h-48 object-contain rounded-lg border-2 border-border bg-muted"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            disabled={uploading}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Supprimer
                        </Button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                            <div className="text-white text-sm">Upload en cours...</div>
                        </div>
                    )}
                </div>
            ) : (
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragActive
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleChange}
                        disabled={uploading}
                    />
                    <div className="flex flex-col items-center gap-2">
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">Upload en cours...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 rounded-full bg-primary/10">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        Glissez une image ou <span className="text-primary">parcourez</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        JPEG, PNG, WebP (max 2MB)
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
