import { useEffect, useState } from 'react';
import { Button, Col, Form, Image, Row } from 'react-bootstrap';
import type { Imenu } from '../../../gastronomia/types/Imenu';
import { ingredientesDB } from '../mock';
import { CategoryTags } from './CategoryTags';
import { IngredientesSelector } from './IngredientsSelector';
import { RestrictionTags } from './RestrictionTags';

export const PlatosTab = () => {
  const [id, setId] = useState('');
  const [dishName, setDishName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [picture, setPicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (picture) {
      const url = URL.createObjectURL(picture);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl('');
    }
  }, [picture]);

  const handleAgregarPlato = () => {
    const plato: Imenu = {
      id: parseInt(id),
      dish_name: dishName,
      price: parseFloat(price),
      category,
      ingredients,
      restrictions,
      picture: previewUrl,
    };

    console.log('Plato a enviar al backend:', plato);

    // limpiar campos
    setId('');
    setDishName('');
    setPrice('');
    setCategory('');
    setIngredients([]);
    setRestrictions([]);
    setPicture(null);
    setPreviewUrl('');
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPicture(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPicture(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Form>
      {/* Nombre y precio */}
      <Row className="mb-3">
        <Col xs={12} md={6}>
          <Form.Control
            type="text"
            placeholder="Nombre del plato"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
          />
        </Col>
        <Col xs={12} md={6} className="mt-2 mt-md-0">
          <Form.Control
            type="number"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </Col>
      </Row>

      {/* Categorías */}
      <Row className="mb-3">
        <Col xs={12}>
          <h3 className="h5">Categorías</h3>
          <CategoryTags selectedCategory={category} onSelect={setCategory} />
        </Col>
      </Row>

      {/* Ingredientes y restricciones */}
      <Row className="mb-3">
        <Col xs={12}>
          <h3 className="h5">Ingredientes</h3>
          <IngredientesSelector
            data={ingredientesDB}
            selected={ingredients}
            onChange={setIngredients}
            placeholder="Buscar ingrediente"
          />{' '}
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12}>
          <h3 className="h5">Restricciones</h3>
          <RestrictionTags
            selectedRestrictions={restrictions}
            onChange={setRestrictions}
          />
        </Col>
      </Row>

      {/* Imagen */}
      <Row className="mb-3 justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              border: '2px dashed #ccc',
              borderRadius: 8,
              padding: 20,
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('pictureInput')?.click()}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Preview"
                thumbnail
                style={{ maxHeight: 200 }}
                fluid
              />
            ) : (
              'Arrastrá la imagen o hacé click para subirla'
            )}
            <input
              type="file"
              id="pictureInput"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handlePictureChange}
            />
          </div>
        </Col>
      </Row>

      {/* Botón */}
      <Row>
        <Col xs={12} className="text-center">
          <Button variant="primary" onClick={handleAgregarPlato}>
            Agregar Plato
          </Button>
        </Col>
      </Row>
    </Form>
  );
};
