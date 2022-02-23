
interface CornerCollision {
	tl: boolean,
	tr: boolean,
	bl: boolean,
	br: boolean
}

function collisions(nft: ObjectState, obstacle: ObjectState): CornerCollision {
	const left = (nft.x < obstacle.x + obstacle.w && nft.x > obstacle.x),
		  	right = (nft.x + nft.w < obstacle.x + obstacle.w && nft.x + nft.w > obstacle.x),
				top = (nft.y < obstacle.y + obstacle.h && nft.y > obstacle.y),
				bottom = (nft.y + nft.h < obstacle.y + obstacle.h && nft.y + nft.h > obstacle.h)
	
	return {
		tl: top && left,
		tr: top && right,
		bl: bottom && left,
		br: bottom && right
	}
}

function collisionAggregator(nft: ObjectState): CornerCollision {
	let cAgg: CornerCollision = {
		tl: false,
		tr: false,
		bl: false,
		br: false,
	}

	ObjectStates.forEach((obstacle) => {
		const collision = collisions(nft, obstacle)
		cAgg = {
			tl: cAgg.tl || collision.tl,
			tr: cAgg.tr || collision.tr,
			bl: cAgg.bl || collision.bl,
			br: cAgg.br || collision.br
		}
	})

	return cAgg
}
