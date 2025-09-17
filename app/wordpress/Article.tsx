import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar, User, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function Article({ data }: { data: any }) {
    // Formatage de la date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Card className="shadow-lg">
                <CardHeader className="space-y-4">
                    {/* Badge de catégorie si disponible */}
                    {data.categories && data.categories.length > 0 && (
                        <div className="flex gap-2">
                            {data.categories.slice(0, 3).map((category: string, index: number) => (
                                <Badge key={index} variant="secondary">
                                    {category}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Titre de l'article */}
                    <CardTitle className="text-3xl font-bold leading-tight">{data.title.rendered}</CardTitle>

                    {/* Métadonnées de l'article */}
                    <CardDescription className="flex items-center gap-4 text-sm">
                        {data.date && (
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(data.date)}</span>
                            </div>
                        )}

                        {data.author && (
                            <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{data.author}</span>
                            </div>
                        )}

                        <a
                            href={data.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span>Voir l'article original</span>
                        </a>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Extrait si disponible */}
                    {data.excerpt && data.excerpt.rendered && (
                        <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                            <div
                                className="text-muted-foreground italic"
                                dangerouslySetInnerHTML={{ __html: data.excerpt.rendered }}
                            />
                        </div>
                    )}

                    {/* Image mise en avant si disponible */}
                    {/* {data.featured_media && data.featured_media_url && (
                        <Image
                            src={data.featured_media_url}
                            alt={data.title.rendered}
                            className="w-full h-auto rounded-lg shadow-md"
                            width={600}
                            height={400}
                        />
                    )} */}

                    {/* Contenu principal de l'article */}
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                        <div
                            dangerouslySetInnerHTML={{ __html: data.content.rendered }}
                            className="
                                [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mt-8 [&>h1]:mb-4
                                [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3
                                [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-4 [&>h3]:mb-2
                                [&>p]:mb-4 [&>p]:leading-relaxed
                                [&>ul]:mb-4 [&>ol]:mb-4
                                [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-6
                                [&>img]:rounded-lg [&>img]:shadow-sm [&>img]:my-6
                                [&>a]:text-primary [&>a]:underline [&>a]:decoration-2 [&>a]:underline-offset-2 [&>a:hover]:decoration-primary
                            "
                        />
                    </div>

                    {/* Tags si disponibles */}
                    {data.tags && data.tags.length > 0 && (
                        <div className="pt-6 border-t">
                            <h4 className="text-sm font-medium mb-3 text-muted-foreground">Tags :</h4>
                            <div className="flex flex-wrap gap-2">
                                {data.tags.map((tag: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        #{tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
