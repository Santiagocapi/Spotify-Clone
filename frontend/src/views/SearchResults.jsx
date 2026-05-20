import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import { usePlayer } from "../context/PlayerContext";
import { Music } from "lucide-react";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();
  const API_URL = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/songs");
        const filtered = res.data.filter(
          (song) =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );
        setSongs(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, [query]);

  if (loading) return <div className="p-10">Buscando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Resultados para "{query}"</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {songs.map((song) => (
          <Card key={song._id} className="cursor-pointer" onClick={() => playSong(song, songs)}>
            <CardContent className="p-4">
              <div className="aspect-square bg-muted mb-2 rounded-md overflow-hidden">
                {song.coverArtPath ? (
                    <img src={`${API_URL}/${song.coverArtPath.replace(/\\/g, "/")}`} className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                        <Music className="h-10 w-10" />
                    </div>
                )}
              </div>
              <h3 className="font-semibold truncate">{song.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {songs.length === 0 && <p className="text-muted-foreground">No se encontraron resultados.</p>}
    </div>
  );
}

export default SearchResults;
