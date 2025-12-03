import { FileText, Pencil, X } from 'lucide-react';
import { formatFileSize, UploadedFile } from '@/lib/storage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FileCardProps {
  file: UploadedFile;
  onCategoryChange: (category: string) => void;
  onRemove: () => void;
}

const fileCategories = [
  'Clinical Notes',
  'Pathology',
  'Radiology',
  'Lab Results',
  'Genomic Report',
  'Other',
];

const FileCard = ({ file, onCategoryChange, onRemove }: FileCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border">
      <div className="flex items-center gap-3">
        <FileText className="w-6 h-6 text-muted-foreground" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{file.name}</span>
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">{formatFileSize(file.size)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={file.fileCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-40 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fileCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={onRemove}
          className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FileCard;
