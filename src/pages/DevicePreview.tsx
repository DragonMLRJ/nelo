import React, { useState } from 'react';
import { Smartphone, Monitor, Tablet, RotateCcw } from 'lucide-react';

const DEVICES = [
    { name: 'iPhone X/XS', width: 375, height: 812, icon: Smartphone },
    { name: 'iPhone 14 Pro', width: 393, height: 852, icon: Smartphone },
    { name: 'Pixel 7', width: 412, height: 915, icon: Smartphone },
    { name: 'iPad Mini', width: 768, height: 1024, icon: Tablet },
    { name: 'Macbook Air', width: 1280, height: 832, icon: Monitor },
];

const DevicePreview: React.FC = () => {
    const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
    const [isLandscape, setIsLandscape] = useState(false);
    const [url, setUrl] = useState('/');

    const width = isLandscape ? selectedDevice.height : selectedDevice.width;
    const height = isLandscape ? selectedDevice.width : selectedDevice.height;

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center py-8">
            {/* Controls */}
            <div className="bg-gray-800 p-4 rounded-xl shadow-xl flex gap-6 items-center mb-8 border border-gray-700">
                <h2 className="text-white font-bold flex items-center gap-2">
                    <Smartphone className="text-teal-400" /> Virtual Phone
                </h2>

                <div className="flex gap-2">
                    {DEVICES.map(dev => (
                        <button
                            key={dev.name}
                            onClick={() => setSelectedDevice(dev)}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-2 ${selectedDevice.name === dev.name ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            <dev.icon className="w-3 h-3" /> {dev.name}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsLandscape(!isLandscape)}
                    className="p-2 bg-gray-700 text-gray-300 rounded hover:text-white"
                    title="Rotate"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 border-l border-gray-600 pl-4">
                    <span className="text-gray-400 text-xs">Page:</span>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-gray-900 border border-gray-600 text-white text-xs px-2 py-1 rounded w-40"
                    />
                    <button onClick={() => { const f = document.querySelector('iframe'); if (f) f.src = url; }} className="text-teal-400 text-xs hover:underline">Go</button>
                </div>
            </div>

            {/* Device Frame */}
            <div
                className="relative bg-black rounded-[3rem] p-4 shadow-2xl transition-all duration-500 border-4 border-gray-800"
                style={{ width: width + 32, height: height + 32 }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-xl z-10"></div>
                <iframe
                    src={url}
                    title="Device Preview"
                    width={width}
                    height={height}
                    className="bg-white rounded-[2rem] overflow-hidden"
                    style={{ border: 'none' }}
                />
                {/* Home Bar */}
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full"></div>
            </div>

            <p className="text-gray-500 text-xs mt-4">Actual CSS pixels: {width}x{height}</p>
        </div>
    );
};

export default DevicePreview;
