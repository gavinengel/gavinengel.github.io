var sub = 
{
	"#calculator": {
		".eval": {
			"@onclick": {
				".screen & value": "`$onClickEqFilter`"
			}
		},
		".num": {
			"@onclick": {
				".screen & value": ["&", "`value`"]
			}
		},
		".dec": {
			"@onclick": {
				".screen & value": ["&", "`$onClickDecimal`"]
			}
		},
		".operator": {
			"@onclick": {
				".screen & value": ["&", "`$onClickOperatorFilter`"]	
			}
		},
		".clear": {
			"@onclick": {
				".screen & value": ''
			}
		}
	}
}