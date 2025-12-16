import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Context
import { useAuthContext } from "../context/AuthContext";

// UI Components (Shadcn UI)
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// Lucide React Icons
import {
  Upload,
  Music,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

function UploadSong() {
  const { user } = useAuthContext();

  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Add new files to the list
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setUploadStatus(null);
    }
  };

  // Delete file from list before upload
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Send to the backend
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    // Add each file with the name 'audio' (matches songRoutes.js)
    files.forEach((file) => {
      formData.append("audio", file);
    });

    try {
      const res = await axios.post("/api/songs/bulk", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUploadStatus("success");
      setMessage(`¡Listo! ${res.data.details.length} canciones añadidas.`);
      setFiles([]); // Clear the list after success
    } catch (error) {
      console.error(error);
      setUploadStatus("error");
      setMessage("Hubo un error al subir los archivos.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 animate-in fade-in zoom-in duration-500">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-primary">
            Subir Canciones
          </h1>
          <p className="text-muted-foreground">
            Arrastra tus archivos MP3. Detectaremos automáticamente título,
            artista y portada.
          </p>
        </div>

        <Card className="border-dashed border-2 border-primary/20 bg-muted/30 hover:bg-muted/50 transition-colors">
          <CardContent className="flex flex-col items-center gap-6 p-10">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-sm">
              <Upload size={40} />
            </div>

            <div className="space-y-4 w-full text-center">
              <label
                htmlFor="music-upload"
                className="cursor-pointer inline-flex items-center justify-center rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
              >
                Seleccionar Archivos
              </label>
              <input
                id="music-upload"
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Soporta MP3, WAV, OGG
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FILES LIST */}
        {files.length > 0 && (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-sm">
                Archivos listos ({files.length})
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-xs h-7 text-destructive hover:text-destructive"
              >
                Limpiar todo
              </Button>
            </div>
            <ScrollArea className="h-48">
              <div className="p-2 space-y-1">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-accent group text-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Music size={14} />
                      </div>
                      <span className="truncate font-medium">{f.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/20">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full font-bold"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Procesando...
                  </>
                ) : (
                  `Subir ${files.length} Canciones`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* STATUS MESSAGES */}
        {uploadStatus === "success" && (
          <div className="flex items-center justify-center gap-3 text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 p-4 rounded-lg border border-green-200 dark:border-green-800 animate-in slide-in-from-bottom-2">
            <CheckCircle2 size={24} />
            <div className="text-sm font-medium">{message}</div>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex items-center justify-center gap-3 text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800 animate-in slide-in-from-bottom-2">
            <AlertCircle size={24} />
            <div className="text-sm font-medium">{message}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadSong;
