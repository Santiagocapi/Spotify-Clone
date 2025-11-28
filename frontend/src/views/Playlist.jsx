import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom"; // useParams - To read the id from the URL,
// useNavigate - To redirect when delete a playlist
import axios from "axios";
// Context
import { useAuthContext } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";

// UI Components (Shadcn UI)
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Lucide React Icons
import { Trash2, Plus, Music, PlayCircle, ArrowLeft } from "lucide-react";

function Playlist() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]); // Songs list and add songs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false); // To show/hide the panel to add songs

  const { playSong } = usePlayer(); // To play a song

  // Function to upload files (playlist and all the songs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // We make the GET request to our backend using populate to get the songs details
        const playlistRes = await axios.get(`/api/playlists/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setPlaylist(playlistRes.data);

        // We make the GET request to our backend to get all songs
        const songsRes = await axios.get("/api/songs");
        setAllSongs(songsRes.data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar la playlist");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [id, user]);

  // Function to Add Songs
  const handleAddSong = async (songId) => {
    try {
      // We make the GET request to our backend to add the song to the playlist
      const updatedPlaylistRes = await axios.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      // Update the playlist in the screen with the response from the server
      setPlaylist(updatedPlaylistRes.data);
      alert("Canción agregada con éxito");
    } catch (err) {
      alert(err.response?.data?.message || "Error al agregar canción");
    }
  };

  // Function to Delete Song
  const handleRemoveSong = async (songId) => {
    if (!window.confirm("¿Quitar esta canción de la lista?")) return;

    try {
      await axios.put(
        `/api/playlists/${id}/remove`,
        { songId },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      // Update the playlist in the screen with the response from the server
      const res = await axios.get(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPlaylist(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error al quitar canción");
    }
  };

  // Funciont to Delete Playlist
  const handleDeletePlaylist = async () => {
    if (!window.confirm("¿Estás seguro de eliminar esta playlist entera?"))
      return;

    try {
      await axios.delete(`/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate("/"); // Back to home
    } catch (err) {
      alert(err.response?.data?.message || "Error al eliminar playlist");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-muted-foreground">Cargando...</div>
    );
  if (error)
    return <div className="p-10 text-center text-destructive">{error}</div>;
  if (!playlist) return <div className="p-10 text-center">No encontrada</div>;

  // Filter songs to no repeat them
  const songsToAdd = allSongs.filter(
    (song) => !playlist.songs.some((pSong) => pSong._id === song._id)
  );

  return (
    <div className="space-y-6 pb-20">
      {/* PLAYLIST HEADER */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end">
        {/* PORTADA */}
        <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-secondary shadow-lg">
          <Music className="h-16 w-16 text-primary" />
        </div>

        {/* PLAYLIST INFO */}
        <div className="flex-1 space-y-2">
          <Link
            to="/"
            className="mb-2 flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {playlist.name}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Playlist pública</span>
            <span>•</span>
            <span>{playlist.songs.length} canciones</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAddSection(!showAddSection)}
            variant={showAddSection ? "secondary" : "default"}
          >
            {showAddSection ? "Cerrar búsqueda" : "Añadir canciones"}
          </Button>
          <Button
            onClick={handleDeletePlaylist}
            variant="destructive"
            size="icon"
            title="Eliminar Playlist"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* ADD SONG SECTION */}
      {showAddSection && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="p-6">
            <h3 className="mb-4 font-semibold">Canciones sugeridas</h3>
            {songsToAdd.length > 0 ? (
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {songsToAdd.map((song) => (
                  <div
                    key={song._id}
                    className="flex items-center justify-between rounded-md border bg-card p-2 shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Music className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <div className="truncate font-medium">{song.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {song.artist}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAddSong(song._id)}
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                    >
                      Añadir
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay más canciones disponibles para agregar.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* SONG LIST (TABLE) */}
      {playlist.songs.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Álbum</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playlist.songs.map((song, index) => (
                <TableRow key={song._id} className="group">
                  <TableCell className="font-medium text-muted-foreground">
                    <span className="group-hover:hidden">{index + 1}</span>
                    <button
                      onClick={() => playSong(song)}
                      className="hidden text-primary group-hover:inline-block"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.artist}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.album}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => handleRemoveSong(song._id)}
                      variant="ghost"
                      size="icon"
                      className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      title="Quitar de la lista"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          <p>Esta playlist está vacía.</p>
          <Button
            variant="link"
            onClick={() => setShowAddSection(true)}
            className="mt-2"
          >
            ¡Busca canciones para añadir!
          </Button>
        </div>
      )}
    </div>
  );
}

export default Playlist;
