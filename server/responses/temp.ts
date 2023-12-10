const handleSearch = async (searchParams: {
	query: string;
	publishedAfter?: string;
	publishedBefore?: string;
	author?: string;
	titleSearch?: boolean;
}) => {
	setLoading(true);
	setError(null);

	const options = {
		url: '/search',
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(searchParams),
		timeout: 720000,
	};

	try {
		const data = await TimeoutWrapper(options);
		console.log(JSON.stringify({ query: searchParams }));
		console.log('Changing Data');
		console.log(JSON.stringify(data));
		//"URL": doc.get("url"), "pdfPath": doc.get("pdfPath"), "Title": doc.get("title"), "Score": score
		setPdfObjects(
			data.map((element: any) => {
				return {
					url: element.URL,
					date: element.TimeStamp,
					relevance: element.Score,
					title: element.Title,
				};
			})
		);
		setLoading(false);
	} catch (err) {
		alert(err);
		console.log(err);
	}
};
