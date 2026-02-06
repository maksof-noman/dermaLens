interface FaceMeshOverlayProps {
  imageData: string;
  className?: string;
}

export default function FaceMeshOverlay({ imageData, className = '' }: FaceMeshOverlayProps) {
  console.log('FaceMeshOverlay rendering with imageData:', imageData ? `${imageData.substring(0, 50)}...` : 'NO IMAGE');

  return (
    <div className={`relative ${className}`}>
      {imageData && (
        <img
          src={imageData}
          alt="Analyzed face"
          className="w-full h-full object-contain"
          onError={(e) => {
            console.error('Failed to load image in FaceMeshOverlay', e);
            console.error('Image src:', imageData?.substring(0, 100));
          }}
          onLoad={() => {
            console.log('Image loaded successfully in FaceMeshOverlay');
          }}
        />
      )}

    </div>
  );
}
