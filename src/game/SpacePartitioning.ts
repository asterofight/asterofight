// namespace A
// {
// 	class SpacePartitioning<T>
// 	{
// 	MapArea = new Rectangle();
// 	AllObjects:T[] = [];
//
// 	PartitionWidth=0;
// 	PartitionHeight=0;
// 	Partitioning=[];
// 		maxRadius = 0;
//
// 	public int Count => AllObjects.Count;
//
// 	public SpacePartitioning( RectangleD mapArea, int width, int height )
// 		{
// 			MapArea = mapArea;
// 			PartitionWidth = width;
// 			PartitionHeight = height;
// 			Partitioning = new List<T>[ PartitionWidth, PartitionHeight ];
// 		}
//
// 	public IEnumerable<T> SelectRegion( Region region, int viewerTeam, Predicate<T> p = null )
// 		{
// 			return new RegionEnumerator( this, region, viewerTeam, p );
// 		}
//
// 	public void Add( T mo )
// 		{
// 			int x, y;
// 			GetCellIndices( mo.Position, out x, out y );
// 			var list = Partitioning[ x, y ];
// 			if ( list == null )
// 				Partitioning[ x, y ] = list = new List<T>( );
// 			list.Add( mo );
// 			AllObjects.Add( mo );
// 			if ( maxRadius < mo.R )
// 				maxRadius = mo.R;
// 		}
//
// 	public bool Remove( T mo )
// 		{
// 			int x, y;
// 			GetCellIndices( mo.Position, out x, out y );
// 			var list = Partitioning[ x, y ];
// 			var ret = list.Remove( mo );
// 			if ( ret )
// 				AllObjects.Remove( mo );
// 			return ret;
// 		}
//
// 	public void RemoveAllDeleted( )
// 		{
// 			for ( int j = 0; j < PartitionHeight; j++ )
// 			for ( int i = 0; i < PartitionWidth; i++ )
// 			if ( Partitioning[ i, j ] != null )
// 				Partitioning[ i, j ].RemoveAll( x => x.Deleted );
// 			AllObjects.RemoveAll( x => x.Deleted );
// 		}
//
// 	public void Move( T mo, Vector2 from )
// 		{
// 			int x1, x2, y1, y2;
// 			GetCellIndices( from, out x1, out y1 );
// 			GetCellIndices( mo.Position, out x2, out y2 );
// 			if ( x1 == x2 && y1 == y2 )
// 				return;
// 			Partitioning[ x1, y1 ].Remove( mo );
// 			var list = Partitioning[ x2, y2 ];
// 			if ( list == null )
// 				Partitioning[ x2, y2 ] = list = new List<T>( );
// 			list.Add( mo );
// 		}
//
// 		void GetCellIndices( Vector2 pos, out int x, out int y )
// 		{
// 			x = (int)( ( ( pos.X - MapArea.X ) / MapArea.W ) * PartitionWidth );
// 			y = (int)( ( ( pos.Y - MapArea.Y ) / MapArea.H ) * PartitionHeight );
// 		}
//
// 		Rectangle GetRectIndices( RectangleD rect )
// 		{
// 			int x1, y1, x2, y2;
// 			GetCellIndices( rect.BaseCorner, out x1, out y1 );
// 			GetCellIndices( rect.OppositeCorner, out x2, out y2 );
// 			if ( x1 < 0 ) x1 = 0; if ( x2 >= PartitionWidth ) x2 = PartitionWidth - 1;
// 			if ( y1 < 0 ) y1 = 0; if ( y2 >= PartitionHeight ) y2 = PartitionHeight - 1;
// 			return new Rectangle( x1, y1, x2 - x1 + 1, y2 - y1 + 1 );
// 		}
//
// 		struct RegionEnumerator : IEnumerable<T>, IEnumerator<T>
// 	{
// 		SpacePartitioning<T> collection;
// 		IEnumerator<T> cellEnumerator;
// 		Predicate<T> pred;
// 		Region region;
// 		int groupId;
// 		Rectangle irect;
// 		int X, Y;
//
// 		public RegionEnumerator( SpacePartitioning<T> collection, Region region, int groupId, Predicate<T> pred )
// 		{
// 			this.collection = collection;
// 			this.region = region;
// 			this.pred = pred;
// 			this.groupId = groupId;
// 			irect = collection.GetRectIndices( RectangleD.Enlarge( this.region.BoundingRect, 1, collection.maxRadius * 2 ) );
// 			X = irect.X - 1;
// 			Y = irect.Y;
// 			cellEnumerator = null;
// 		}
// 	public IEnumerator<T> GetEnumerator( ) { return this; }
// 		System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator( ) { return this; }
//
// 	public T Current { get { return cellEnumerator.Current; } }
// 		object System.Collections.IEnumerator.Current { get { return cellEnumerator.Current; } }
//
// 	public void Dispose( )
// 		{
// 			if ( cellEnumerator != null )
// 				cellEnumerator.Dispose( );
// 		}
//
//
// 	public bool MoveNext( )
// 		{
// 			do
// 			{
// 				while ( cellEnumerator == null || !cellEnumerator.MoveNext( ) )
// 				{
// 					if ( cellEnumerator != null )
// 					{
// 						cellEnumerator.Dispose( );
// 						cellEnumerator = null;
// 					}
// 					X++;
// 					if ( X == irect.Right )
// 					{
// 						Y++;
// 						X = irect.X;
// 					}
// 					if ( Y == irect.Bottom )
// 						return false;
// 					var list = collection.Partitioning[ X, Y ];
// 					if ( list != null )
// 						cellEnumerator = list.GetEnumerator( );
// 				}
// 			}
// 			while (
// 				Current.Deleted ||
// 				!region.IntersectsWith( Current.Position, Current.R ) ||
// 				!Current.IsVisibleFrom( region.Center, groupId ) ||
// 				pred != null && !pred( Current ) );
// 			return true;
// 		}
//
// 	public void Reset( )
// 		{
// 			if ( cellEnumerator != null )
// 			{
// 				cellEnumerator.Dispose( );
// 				cellEnumerator = null;
// 			}
// 			X = irect.X - 1;
// 			Y = irect.Y;
// 		}
// 	}
//
// 	}
// }
