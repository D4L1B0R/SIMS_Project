"use client"
import Navbar from "@/components/Navbar";
import { AdDTO } from "@/lib/dtos";
import { Eye, DollarSign, Building, Calendar, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Page(){
	const [ad, setAd] = useState<any>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const params = useParams();
	const adId = params.adId;

	useEffect(() => {
		fetchAd();
	}, [adId]);

	const fetchAd = async () => {
		try {
			setLoading(true);
			const response = await fetch(`/api/ad/${adId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch ad');
			}
			const adData = await response.json();
			
			if (adData.success && adData.data) {
				setAd(adData.data);
			} else if (adData.id) {
				setAd(adData);
			} else {
				setAd(null);
			}
			
			setError(null);
  	} catch (err) {
			console.error('Error fetching ad:', err);
			setError('Došlo je do greške pri učitavanju reklame');
  	} finally {
    	setLoading(false);
  	}
	};

	return(
		<>
			<Navbar />
			<div className="min-h-screen bg-gray-50">
				<div className="max-w-4xl mx-auto px-4 py-8">
					{loading ? (
						<div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-lg">
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-4 text-gray-600">Učitavanje reklame...</p>
							</div>
						</div>
					) : error ? (
						<div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-lg">
							<div className="text-center text-red-600">
								<p className="text-lg">{error}</p>
								<button 
									onClick={fetchAd}
									className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
								>
									Pokušaj ponovo
								</button>
							</div>
						</div>
					) : ad ? (
						<div className="w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
							<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
								<h1 className="text-3xl font-bold mb-4">Reklama</h1>
								<p className="text-xl opacity-90">{ad.description || 'Reklamni sadržaj'}</p>
							</div>
							
							<div className="p-8">
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
									<div className="space-y-6">
										<div>
											<h2 className="text-2xl font-bold text-gray-900 mb-4">Osnovne informacije</h2>
											
											<div className="space-y-4">
												{/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
													<span className="font-semibold text-gray-700">ID reklame:</span>
													<span className="text-blue-600 font-bold">#{ad.id}</span>
												</div> */}
												
												<div className="p-4 bg-gray-50 rounded-lg">
													<h3 className="font-semibold text-gray-700 mb-2">Opis reklame:</h3>
													<p className="text-gray-600">{ad.description || 'Nema opisa'}</p>
												</div>
												
												{ad.resource_url && (
													<div className="p-4 bg-gray-50 rounded-lg">
														<h3 className="font-semibold text-gray-700 mb-2">URL reklame:</h3>
														<a 
															href={ad.resource_url} 
															target="_blank" 
															rel="noopener noreferrer"
															className="text-blue-600 hover:text-blue-800 break-all"
														>
															{ad.resource_url}
														</a>
													</div>
												)}
											</div>
										</div>

										{ad.adStats && (
											<div>
												<h2 className="text-2xl font-bold text-gray-900 mb-4">Statistike reklame</h2>
												<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
													<div className="bg-blue-50 p-4 rounded-lg text-center">
														<Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
														<div className="text-2xl font-bold text-blue-600">{ad.adStats.number_of_views}</div>
														<div className="text-sm text-gray-600">Pregleda</div>
													</div>
													
													<div className="bg-green-50 p-4 rounded-lg text-center">
														<DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
														<div className="text-2xl font-bold text-green-600">${ad.adStats.ad_costs}</div>
														<div className="text-sm text-gray-600">Troškovi</div>
													</div>
													
													<div className="bg-purple-50 p-4 rounded-lg text-center">
														<DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
														<div className="text-2xl font-bold text-purple-600">${ad.adStats.revenue.toFixed(2)}</div>
														<div className="text-sm text-gray-600">Prihod</div>
													</div>
												</div>
											</div>
										)}
									</div>

									{ad.sponsor && (
										<div className="space-y-6">
											<div>
												<h2 className="text-2xl font-bold text-gray-900 mb-4">Sponzor</h2>
												
												<div className="bg-gray-50 rounded-lg p-6 space-y-4">
													<div className="flex items-center space-x-3">
														<Building className="w-6 h-6 text-gray-600" />
														<div>
															<div className="font-semibold text-gray-700">Kompanija</div>
															<div className="text-gray-900 text-lg">{ad.sponsor.company_name}</div>
														</div>
													</div>
													
													<div className="flex items-center space-x-3">
														<User className="w-6 h-6 text-gray-600" />
														<div>
															<div className="font-semibold text-gray-700">Kontakt osoba</div>
															<div className="text-gray-900">
																{ad.sponsor.first_name} {ad.sponsor.last_name}
															</div>
														</div>
													</div>
													
													
													{ad.sponsor.phone_number && (
														<div className="flex items-center space-x-3">
															<div className="w-6 h-6 text-gray-600 text-center">📞</div>
															<div>
																<div className="font-semibold text-gray-700">Telefon</div>
																<div className="text-gray-900">{ad.sponsor.phone_number}</div>
															</div>
														</div>
													)}
													
													{ad.sponsor.pib && (
														<div className="flex items-center space-x-3">
															<div className="w-6 h-6 text-gray-600 text-center">🏢</div>
															<div>
																<div className="font-semibold text-gray-700">PIB</div>
																<div className="text-gray-900">{ad.sponsor.pib}</div>
															</div>
														</div>
													)}
													
												</div>
											</div>

											{ad.resource_url && (
												<div className="text-center">
													<a 
														href={ad.resource_url}
														target="_blank"
														rel="noopener noreferrer"
														className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
													>
														Posetite naš sajt
													</a>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
							
							<div className="bg-gray-100 p-4 text-center border-t border-gray-200">
								<p className="text-sm text-gray-600">
									Reklamni sadržaj • {ad.sponsor?.company_name || 'Sponzor'} • {new Date().getFullYear()}
								</p>
							</div>
						</div>
					) : (
						<div className="w-full h-96 flex items-center justify-center bg-white rounded-lg shadow-lg">
							<div className="text-center text-gray-500">
								<p className="text-lg">Reklama nije pronađena</p>
								<button 
									onClick={fetchAd}
									className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
								>
									Pokušaj ponovo
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}