import React, { useState, FormEvent, ChangeEvent } from "react";
import { Map, Marker, TileLayer } from 'react-leaflet';
import L, { LeafletMouseEvent } from 'leaflet';
import api from "../services/api";

import {  FiPlus } from "react-icons/fi";
import Sidebar from '../components/Sidebar';
import mapMarkerImg from '../images/map-marker.svg';

import '../styles/pages/create-orphanage.css';
import { useHistory } from "react-router-dom";

const happyMapIcon = L.icon({
  iconUrl: mapMarkerImg,

  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [0, -60]
})

export default function CreateOrphanage() {

  const history = useHistory();

  const [position, setPosition] = useState({latitude: 0, longitude: 0});
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [instructions, setInstructions] = useState("");
  const [opening_hours, setOpeningHours] = useState("");
  const [open_on_weekends, setOpenOnWeekends] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([])

  function handleMapClick(event:LeafletMouseEvent) {
    const { latlng } = event;
    setPosition({
      latitude: latlng.lat,
      longitude: latlng.lng,
    })
  }

  async function handleSubmit(e: FormEvent){
    e.preventDefault();
    
    const {latitude, longitude} = position;

    const form = new FormData();

    form.append('name', name);
    form.append('latitude', String(latitude));
    form.append('longitude', String(longitude));
    form.append('about', about);
    form.append('instructions', instructions);
    form.append('opening_hours', opening_hours);
    form.append('open_on_weekends', String(open_on_weekends));
    
    images.forEach(img => form.append('images', img));

    await api.post('orphanages', form);

    alert('Cadastro realizado com sucesso!');
    history.push('/app');
  }

  function handleSelectImages(e: ChangeEvent<HTMLInputElement>) {

    if(!e.target.files) {
      return
    }

    const selectedImages = Array.from(e.target.files)

    setImages(selectedImages);

    const previewSelectedImages = selectedImages.map(img => URL.createObjectURL(img));

    setPreviewImages(previewSelectedImages);
  }

  return (
    <div id="page-create-orphanage">

      <Sidebar/>

      <main>
        <form className="create-orphanage-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>Dados</legend>

            <Map 
              center={[-27.2092052,-49.6401092]} 
              style={{ width: '100%', height: 280 }}
              zoom={15}
              onClick={handleMapClick}
            >
              <TileLayer 
                url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {position.latitude !== 0 && (
                <Marker 
                  interactive={false} 
                  icon={happyMapIcon} 
                  position={[position.latitude, position.longitude]} 
                />
              )}
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)}/>
            </div>

            <div className="input-block">
              <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
              <textarea id="name" maxLength={300} value={about} onChange={(e) => setAbout(e.target.value)}/>
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">

                {previewImages.map((img, i) => {
                  return (
                    <img key={i} src={img} alt={img} />
                  );
                })}

                <label htmlFor="image[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>

              </div>
              <input 
                multiple 
                type="file" 
                id="image[]"
                onChange={handleSelectImages}
              />
              
            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea id="instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)}/>
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input id="opening_hours" value={opening_hours} onChange={(e) => setOpeningHours(e.target.value)}/>
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button 
                  type="button" 
                  className={open_on_weekends ? 'active' : ''} 
                  onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>
                <button 
                  type="button" 
                  className={open_on_weekends ? '' : 'active'}
                  onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}

// return `https://a.tile.openstreetmap.org/${z}/${x}/${y}.png`;
