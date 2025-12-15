import { IProductContentItem, typeBeybladeProductContent } from '@/app/oldBeyblade/model/typesBeyblade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface ProductContentItemProps {
    item: IProductContentItem;
    index: number;
    onUpdate: (index: number, field: keyof IProductContentItem, value: any) => void;
    onDelete: (index: number) => void;
}

export function ProductContentItem({ item, index, onUpdate, onDelete }: ProductContentItemProps) {
    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Item #{index + 1}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(index)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor={`type-${index}`}>Type</Label>
                        <Select value={item.type} onValueChange={(value) => onUpdate(index, 'type', value)}>
                            <SelectTrigger id={`type-${index}`}>
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeBeybladeProductContent.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor={`name-${index}`}>Name</Label>
                        <Input id={`name-${index}`} value={item.name} onChange={(e) => onUpdate(index, 'name', e.target.value)} placeholder="Item name" />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor={`notes-${index}`}>Notes (optional)</Label>
                    <Textarea
                        id={`notes-${index}`}
                        value={item.notes || ''}
                        onChange={(e) => onUpdate(index, 'notes', e.target.value)}
                        placeholder="Special color, tournament edition, etc."
                        rows={3}
                        className="resize-none"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id={`review-${index}`} checked={item.toReview || false} onCheckedChange={(checked) => onUpdate(index, 'toReview', checked === true)} />
                    <Label htmlFor={`review-${index}`} className="text-sm font-medium leading-none cursor-pointer">
                        Needs review
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
